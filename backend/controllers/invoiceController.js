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
    distinct: true // Required for correct count with includes
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

  // Security check for customers
  if (req.user.role === 'customer' && invoice.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(invoice);
});

exports.createInvoice = catchAsync(async (req, res, next) => {
  const { items, ...invoiceData } = req.body;

  const result = await sequelize.transaction(async (t) => {
    // Use MAX id to avoid duplicate numbers when invoices are deleted
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
      discountAmount: 0, // Will be updated after calculation
      discountType: invoiceData.discountType || null,
      couponCode: invoiceData.couponCode || null,
      paymentMode: invoiceData.paymentMode || 'CASH',
      utrNumber: invoiceData.utrNumber || null,
      doctorId: invoiceData.doctorId || null,
      doctorCharges: parseFloat(invoiceData.doctorCharges) || 0,
      subtotal: 0, // Will be updated
      tax: 0,
      total: 0,
    }, { transaction: t });

    let calculatedSubtotal = parseFloat(invoiceData.doctorCharges) || 0;

    if (items && items.length > 0) {
      for (const item of items) {
        let product = null;
        
        // 1. Find product by ID or Name (Inventory Drift Prevention)
        if (item.productId) {
          product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        } else {
          // Fallback: check if the itemName matches a product exactly
          product = await Product.findOne({ where: { name: item.itemName }, transaction: t, lock: t.LOCK.UPDATE });
        }

        if (product) {
          if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}`);
          }
          await product.update({ quantity: product.quantity - item.quantity }, { transaction: t });
          
          if (product.quantity <= 5) {
            await notifyAdmins('Low Stock Alert', `Product "${product.name}" is running low on stock (${product.quantity} left).`, 'warning', '/products');
          }

          logActivity(req.user.id, 'update', 'Product', product.id,
            `Inventory deducted: ${item.quantity} units for invoice ${invoiceNumber}`, { transaction: t });
        }

        // 2. Recalculate item total and add to subtotal (Financial Integrity)
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

    // 3. Final Financial Recalculation
    const calculatedTax = calculatedSubtotal * 0.05; // Hardcoded 5% for now as per frontend
    
    let calculatedDiscount = 0;
    if (invoiceData.discountType === 'FLAT') {
      calculatedDiscount = parseFloat(invoiceData.discountAmount) || 0;
    } else if (invoiceData.discountType === 'PERCENTAGE') {
      calculatedDiscount = (calculatedSubtotal * (parseFloat(invoiceData.discountAmount) || 0)) / 100;
    }

    // Add coupon discount if applicable
    if (invoiceData.couponCode) {
      const { Coupon } = require('../models');
      const coupon = await Coupon.findOne({ where: { code: invoiceData.couponCode, isActive: true } });
      if (coupon) {
        if (coupon.type === 'FLAT') {
          calculatedDiscount += parseFloat(coupon.value);
        } else {
          calculatedDiscount += (calculatedSubtotal * parseFloat(coupon.value)) / 100;
        }
      }
    }

    const finalTotal = Math.max(0, calculatedSubtotal + calculatedTax - calculatedDiscount);

    await invoice.update({
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      discountAmount: calculatedDiscount,
      total: finalTotal
    }, { transaction: t });

    // Notify admins and customer (if linked)
    await notifyAdmins('New Invoice Generated', `Invoice ${invoiceNumber} created for ${invoiceData.customerName}`, 'info', `/invoices`);
    if (invoiceData.userId) {
      await notify(invoiceData.userId, 'New Invoice', `A new invoice ${invoiceNumber} has been generated for you.`, 'success', `/my-invoices`);
    }

    return invoice;
  });

  logActivity(req.user.id, 'create', 'Invoice', result.id, `Generated invoice ${result.invoiceNumber}`);
  const fullInvoice = await Invoice.findByPk(result.id, { include: [InvoiceItem] });
  res.status(201).json(fullInvoice);
});

exports.updateInvoice = catchAsync(async (req, res, next) => {
  const { status, items } = req.body;
  const invoice = await Invoice.findByPk(req.params.id, { include: [InvoiceItem] });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const oldStatus = invoice.status;
  const newStatus = status || oldStatus;
  
  await sequelize.transaction(async (t) => {
    // 1. If status is changing TO Cancelled, restore all stock
    if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (const item of invoice.InvoiceItems) {
        if (item.productId) {
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (product) {
            await product.update({ quantity: product.quantity + item.quantity }, { transaction: t });
          }
        }
      }
    }
    
    // 2. If status is changing FROM Cancelled to something else, re-deduct stock
    if (oldStatus === 'Cancelled' && newStatus !== 'Cancelled') {
      for (const item of invoice.InvoiceItems) {
        if (item.productId) {
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (!product || product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${item.itemName} to reactivate invoice`);
          }
          await product.update({ quantity: product.quantity - item.quantity }, { transaction: t });
        }
      }
    }

    // 3. Update invoice details
    await invoice.update({ status: newStatus }, { transaction: t });

    // Notify on status change
    if (newStatus === 'Paid' && oldStatus !== 'Paid') {
      await notifyAdmins('Invoice Paid', `Invoice ${invoice.invoiceNumber} has been marked as Paid.`, 'success', `/invoices`);
      if (invoice.userId) {
        await notify(invoice.userId, 'Payment Received', `Payment for invoice ${invoice.invoiceNumber} has been confirmed. Thank you!`, 'success', `/my-invoices`);
      }
    }
  });

  logActivity(req.user.id, 'update', 'Invoice', invoice.id, `Updated invoice ${invoice.invoiceNumber} status from ${oldStatus} to ${newStatus}`);
  
  const updatedInvoice = await Invoice.findByPk(invoice.id, { include: [InvoiceItem] });
  res.json(updatedInvoice);
});

exports.deleteInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findByPk(req.params.id, { include: [InvoiceItem] });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status !== 'Draft') {
    return res.status(400).json({ error: 'Only Draft invoices can be deleted. Cancel it first.' });
  }

  await sequelize.transaction(async (t) => {
    for (const item of invoice.InvoiceItems) {
      if (item.productId) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (product) {
          await product.update({ quantity: product.quantity + item.quantity }, { transaction: t });
        }
      }
    }
    await invoice.destroy({ transaction: t });
  });

  logActivity(req.user.id, 'delete', 'Invoice', invoice.id, `Deleted draft invoice ${invoice.invoiceNumber}`);
  res.json({ message: 'Invoice deleted and stock restored' });
});

