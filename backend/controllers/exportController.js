const { Invoice, Appointment, User, Doctor, Product } = require('../models');
const { Parser } = require('json2csv');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

exports.exportInvoices = catchAsync(async (req, res) => {
  const { startDate, endDate, status, search } = req.query;
  const where = {};
  
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  }
  if (status && status !== 'all') {
    where.status = status;
  }
  if (search) {
    where[Op.or] = [
      { customerName: { [Op.like]: `%${search}%` } },
      { invoiceNumber: { [Op.like]: `%${search}%` } }
    ];
  }

  const invoices = await Invoice.findAll({
    where,
    order: [['createdAt', 'DESC']]
  });

  const fields = [
    { label: 'Date', value: (row) => new Date(row.createdAt).toLocaleDateString() },
    { label: 'Invoice #', value: 'invoiceNumber' },
    { label: 'Customer', value: 'customerName' },
    { label: 'Phone', value: 'phone' },
    { label: 'Subtotal', value: 'subtotal' },
    { label: 'Discount', value: 'discountAmount' },
    { label: 'Total', value: 'total' },
    { label: 'Payment Mode', value: 'paymentMode' },
    { label: 'Status', value: 'status' }
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(invoices);

  res.header('Content-Type', 'text/csv');
  res.attachment(`invoices_${new Date().toISOString().split('T')[0]}.csv`);
  return res.send(csv);
});

exports.exportAppointments = catchAsync(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  const where = {};

  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  }
  if (status && status !== 'all') {
    where.status = status;
  }

  const appointments = await Appointment.findAll({
    where,
    include: [{ model: User, as: 'customer' }, Doctor],
    order: [['date', 'DESC'], ['time', 'DESC']]
  });

  const fields = [
    { label: 'Date', value: 'date' },
    { label: 'Time', value: 'time' },
    { label: 'Customer', value: (row) => row.customer?.name || 'N/A' },
    { label: 'Doctor', value: (row) => row.Doctor?.name || 'N/A' },
    { label: 'Status', value: 'status' },
    { label: 'Reason', value: 'reason' }
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(appointments);

  res.header('Content-Type', 'text/csv');
  res.attachment(`appointments_${new Date().toISOString().split('T')[0]}.csv`);
  return res.send(csv);
});

exports.exportInventory = catchAsync(async (req, res) => {
  const products = await Product.findAll({
    order: [['name', 'ASC']]
  });

  const fields = [
    { label: 'Product Name', value: 'name' },
    { label: 'SKU', value: 'sku' },
    { label: 'Category', value: 'category' },
    { label: 'Price', value: 'price' },
    { label: 'Stock', value: 'quantity' },
    { label: 'Min Stock', value: 'minStock' },
    { label: 'Status', value: (row) => row.quantity <= row.minStock ? 'LOW STOCK' : 'OK' }
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(products);

  res.header('Content-Type', 'text/csv');
  res.attachment(`inventory_${new Date().toISOString().split('T')[0]}.csv`);
  return res.send(csv);
});
