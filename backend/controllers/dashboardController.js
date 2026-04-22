const { Product, Appointment, Invoice, InvoiceItem, Service, Coupon, Doctor, sequelize } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

exports.getStats = catchAsync(async (req, res, next) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

  // --- Core counts (always safe) ---
  const [totalProducts, totalAppointments, totalInvoices] = await Promise.all([
    Product.count(),
    Appointment.count(),
    Invoice.count(),
  ]);

  // --- Revenue totals ---
  const [revenueTotal, revenueThisMonth, revenueLastMonth] = await Promise.all([
    Invoice.sum('total', { where: { status: 'Paid' } }),
    Invoice.sum('total', { where: { status: 'Paid', createdAt: { [Op.gte]: startOfMonth } } }),
    Invoice.sum('total', { where: { status: 'Paid', createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
  ]);

  // --- Invoice status breakdown ---
  const invoiceStatuses = await Invoice.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['status'],
    raw: true,
  });

  // --- Payment mode breakdown ---
  const paymentModes = await Invoice.findAll({
    attributes: ['paymentMode', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['paymentMode'],
    raw: true,
  });

  // --- Recent invoices (last 5) ---
  const recentInvoices = await Invoice.findAll({
    attributes: ['id', 'invoiceNumber', 'customerName', 'total', 'status', 'paymentMode', 'createdAt'],
    order: [['createdAt', 'DESC']],
    limit: 5,
    raw: true,
  });

  // --- Low stock products (quantity <= 5 but > 0) ---
  const lowStockProducts = await Product.findAll({
    where: { quantity: { [Op.lte]: 5, [Op.gt]: 0 } },
    attributes: ['id', 'name', 'quantity'],
    order: [['quantity', 'ASC']],
    limit: 5,
    raw: true,
  });

  // --- Out of stock count ---
  const outOfStockCount = await Product.count({ where: { quantity: 0 } });

  // --- Appointments this week ---
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const appointmentsThisWeek = await Appointment.count({
    where: { date: { [Op.gte]: startOfWeek.toISOString().split('T')[0] } }
  });

  // --- Top selling products (by quantity sold in InvoiceItems) ---
  // Only use columns confirmed to exist: itemName, quantity, productId, id
  let topProducts = [];
  try {
    topProducts = await InvoiceItem.findAll({
      attributes: ['itemName', [sequelize.fn('SUM', sequelize.col('quantity')), 'sold']],
      where: { productId: { [Op.ne]: null } },
      group: ['itemName'],
      order: [[sequelize.literal('sold'), 'DESC']],
      limit: 5,
      raw: true,
    });
  } catch (e) {
    topProducts = [];
  }

  // --- Top services (items without productId = service items) ---
  // serviceId column may not exist; use productId IS NULL as proxy for service items
  let topServices = [];
  try {
    topServices = await InvoiceItem.findAll({
      attributes: ['itemName', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { productId: null },
      group: ['itemName'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5,
      raw: true,
    });
  } catch (e) {
    topServices = [];
  }

  // --- Active coupons ---
  let activeCoupons = 0;
  try {
    activeCoupons = await Coupon.count({
      where: {
        isActive: true,
        [Op.or]: [
          { expiryDate: null },
          { expiryDate: { [Op.gt]: new Date() } }
        ]
      }
    });
  } catch (e) {
    activeCoupons = 0;
  }

  // --- Doctor performance (consultation fees) ---
  const doctorPerformance = await Invoice.findAll({
    attributes: [
      'doctorId',
      [sequelize.fn('SUM', sequelize.col('doctorCharges')), 'totalDoctorCharges'],
      [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
      [sequelize.fn('COUNT', sequelize.col('Invoice.id')), 'invoiceCount'],
    ],
    where: { status: 'Paid', doctorId: { [Op.ne]: null } },
    include: [{ model: Doctor, attributes: ['name'] }],
    group: ['doctorId', 'Doctor.id'],
    order: [[sequelize.literal('totalRevenue'), 'DESC']],
    raw: true,
  });

  // --- Revenue Trend (Last 6 months) ---
  const revenueTrend = await Invoice.findAll({
    attributes: [
      [sequelize.fn('DATE_FORMAT', sequelize.col('Invoice.createdAt'), '%Y-%m'), 'month'],
      [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
    ],
    where: { status: 'Paid', createdAt: { [Op.gte]: new Date(today.getFullYear(), today.getMonth() - 5, 1) } },
    group: [sequelize.fn('DATE_FORMAT', sequelize.col('Invoice.createdAt'), '%Y-%m')],
    order: [[sequelize.literal('month'), 'ASC']],
    raw: true,
  });

  res.json({
    totalProducts,
    totalAppointments,
    totalInvoices,
    revenue: revenueTotal || 0,
    revenueThisMonth: revenueThisMonth || 0,
    revenueLastMonth: revenueLastMonth || 0,
    invoiceStatuses,
    paymentModes,
    recentInvoices,
    lowStockProducts,
    outOfStockCount,
    appointmentsThisWeek,
    topProducts,
    topServices,
    activeCoupons,
    doctorPerformance,
    revenueTrend,
  });
});
