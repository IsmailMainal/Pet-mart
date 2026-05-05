const { Invoice, InvoiceItem, Product, Doctor, Coupon, sequelize } = require('../models');
const { Op } = require('sequelize');
const logActivity = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const { notify, notifyAdmins } = require('../utils/notifier');

exports.getInvoices = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const status = req.query.status || 'all';

  const where = {};
  if (req.user.role === 'customer') {
    where.userId = req.user.id;
  }

  if (status !== 'all') {
    where.status = status;
  }

  if (search) {
    where[Op.or] = [
      { customerName: { [Op.like]: `%${search}%` } },
      { invoiceNumber: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows } = await Invoice.findAndCountAll({ 
    where,
    include: [
      { model: InvoiceItem, include: [Product] },
      { model: Doctor }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  res.json({
    invoices: rows,
    meta: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  });
});

exports.getInvoiceById = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findByPk(req.params.id, { 
    include: [
      { model: InvoiceItem, include: [Product] },
      { model: Doctor }
    ] 
  });
  if (!invoice) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'customer' && invoice.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(invoice);
});

exports.createInvoice = catchAsync(async (req, res, next) => {
  const { items, ...invoiceData } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const maxResult = await Invoice.findOne({
      attributes: [[sequelize.fn('MAX', sequelize.col('id')), 'maxId']],
      transaction: t,
      raw: true,
    });
    const nextNum = (maxResult?.maxId || 0) + 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      ...invoiceData,
      invoiceNumber,
      createdBy: req.user.id,
    }, { transaction: t });

    let calculatedSubtotal = parseFloat(invoiceData.doctorCharges) || 0;

    if (items && items.length > 0) {
      for (const item of items) {
        let product = null;
        if (item.productId) {
          product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        }

        if (product) {
          if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}`);
          }
          await product.update({ quantity: product.quantity - item.quantity }, { transaction: t });
        }

        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        const itemTotal = itemPrice * itemQuantity;
        calculatedSubtotal += itemTotal;

        await InvoiceItem.create({ 
          ...item, 
          productId: product ? product.id : (item.productId || null),
          price: itemPrice,
          quantity: itemQuantity,
          total: itemTotal,
          invoiceId: invoice.id 
        }, { transaction: t });
      }
    }

    const calculatedTax = 0;
    let calculatedDiscount = parseFloat(invoiceData.discountAmount) || 0;
    const finalTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);

    // Increment coupon usage if provided
    if (invoiceData.couponCode) {
      await Coupon.update(
        { usageCount: sequelize.literal('usageCount + 1') },
        { where: { code: invoiceData.couponCode }, transaction: t }
      );
    }

    await invoice.update({
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: finalTotal
    }, { transaction: t });

    return invoice;
  });

  logActivity(req.user.id, 'create', 'Invoice', result.id, `Generated invoice ${result.invoiceNumber}`);
  
  // Notify customer
  if (result.userId) {
    await notify(result.userId, 'New Invoice Generated 📄', `A new invoice ${result.invoiceNumber} for $${result.total} has been generated for you.`, 'info', '/dashboard/my-bills');
  }

  const fullInvoice = await Invoice.findByPk(result.id, { include: [InvoiceItem] });
  res.status(201).json(fullInvoice);
});

exports.updateInvoice = catchAsync(async (req, res, next) => {
  const { items, status, ...updateData } = req.body;
  const invoice = await Invoice.findByPk(req.params.id, { include: [InvoiceItem] });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const oldStatus = invoice.status;
  const newStatus = status || oldStatus;

  const result = await sequelize.transaction(async (t) => {
    // 1. Restore old stock if the invoice wasn't already cancelled
    if (oldStatus !== 'Cancelled') {
      for (const item of invoice.InvoiceItems) {
        if (item.productId) {
          const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
          if (product) {
            await product.update({ quantity: product.quantity + item.quantity }, { transaction: t });
          }
        }
      }
    }

    // 2. Clear old items
    await InvoiceItem.destroy({ where: { invoiceId: invoice.id }, transaction: t });

    // 3. Process new items and deduct stock (unless new status is Cancelled)
    let calculatedSubtotal = parseFloat(updateData.doctorCharges) || 0;
    
    if (items && items.length > 0) {
      for (const item of items) {
        let product = null;
        if (item.productId && newStatus !== 'Cancelled') {
          product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
          if (product) {
            if (product.quantity < item.quantity) {
              throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}`);
            }
            await product.update({ quantity: product.quantity - item.quantity }, { transaction: t });
          }
        }

        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        const itemTotal = itemPrice * itemQuantity;
        calculatedSubtotal += itemTotal;

        await InvoiceItem.create({
          ...item,
          productId: item.productId || null,
          price: itemPrice,
          quantity: itemQuantity,
          total: itemTotal,
          invoiceId: invoice.id
        }, { transaction: t });
      }
    }

    // 4. Recalculate financial totals
    const calculatedTax = 0;
    const calculatedDiscount = parseFloat(updateData.discountAmount) || 0;
    const finalTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);

    // Handle coupon usage change
    if (updateData.couponCode && updateData.couponCode !== invoice.couponCode) {
      // Increment new coupon
      await Coupon.update(
        { usageCount: sequelize.literal('usageCount + 1') },
        { where: { code: updateData.couponCode }, transaction: t }
      );
      // Decrement old coupon
      if (invoice.couponCode) {
        await Coupon.update(
          { usageCount: sequelize.literal('usageCount - 1') },
          { where: { code: invoice.couponCode }, transaction: t }
        );
      }
    }

    await invoice.update({
      ...updateData,
      status: newStatus,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: finalTotal
    }, { transaction: t });

    return invoice;
  });

  logActivity(req.user.id, 'update', 'Invoice', invoice.id, `Updated invoice ${invoice.invoiceNumber}`);
  const fullInvoice = await Invoice.findByPk(invoice.id, { include: [InvoiceItem] });
  res.json(fullInvoice);
});

exports.deleteInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findByPk(req.params.id, { include: [InvoiceItem] });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  
  if (invoice.status !== 'Draft' && req.user.role !== 'admin') {
    return res.status(400).json({ error: 'Only admins can delete non-draft invoices.' });
  }

  await sequelize.transaction(async (t) => {
    if (invoice.status !== 'Cancelled') {
      for (const item of invoice.InvoiceItems) {
        if (item.productId) {
          const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
          if (product) {
            await product.update({ quantity: product.quantity + item.quantity }, { transaction: t });
          }
        }
      }
    }
    await invoice.destroy({ transaction: t });
  });

  logActivity(req.user.id, 'delete', 'Invoice', invoice.id, `Deleted invoice ${invoice.invoiceNumber}`);
  res.json({ message: 'Invoice deleted and stock restored' });
});
