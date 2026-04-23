const { Coupon } = require('../models');
const catchAsync = require('../utils/catchAsync');
const logActivity = require('../utils/logger');
const { Op } = require('sequelize');

exports.getCoupons = catchAsync(async (req, res) => {
  const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
  res.json(coupons);
});

exports.getCouponById = catchAsync(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
  res.json(coupon);
});

exports.createCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  logActivity(req.user.id, 'create', 'Coupon', coupon.id, `Created coupon ${coupon.code}`);
  res.status(201).json(coupon);
});

exports.updateCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
  
  await coupon.update(req.body);
  logActivity(req.user.id, 'update', 'Coupon', coupon.id, `Updated coupon ${coupon.code}`);
  res.json(coupon);
});

exports.deleteCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
  
  await coupon.destroy();
  logActivity(req.user.id, 'delete', 'Coupon', req.params.id, `Deleted coupon ${coupon.code}`);
  res.json({ message: 'Coupon deleted' });
});

exports.validateCoupon = catchAsync(async (req, res) => {
  const { code, amount } = req.body;
  const coupon = await Coupon.findOne({
    where: {
      code: code.toUpperCase(),
      isActive: true,
      [Op.or]: [
        { expiryDate: null },
        { expiryDate: { [Op.gt]: new Date() } }
      ]
    }
  });

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    return res.status(400).json({ error: 'This coupon has reached its maximum usage limit' });
  }

  if (amount < coupon.minPurchase) {
    return res.status(400).json({ error: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon` });
  }

  let discount = 0;
  if (coupon.type === 'FLAT') {
    discount = parseFloat(coupon.value);
  } else {
    discount = (parseFloat(amount) * parseFloat(coupon.value)) / 100;
  }

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount: discount
  });
});
