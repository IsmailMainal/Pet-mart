const { Doctor, Invoice, Settlement, sequelize } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const logActivity = require('../utils/logger');

exports.getDoctorRevenue = catchAsync(async (req, res) => {
  // 1. Get all doctors
  const doctors = await Doctor.findAll({
    attributes: ['id', 'name', 'specialization'],
    raw: true
  });

  // 2. Get total charges per doctor from Paid invoices
  const earnings = await Invoice.findAll({
    attributes: [
      'doctorId',
      [sequelize.fn('SUM', sequelize.col('doctorCharges')), 'totalEarned']
    ],
    where: { status: 'Paid', doctorId: { [Op.ne]: null } },
    group: ['doctorId'],
    raw: true
  });

  // 3. Get total settled amounts per doctor
  const settlements = await Settlement.findAll({
    attributes: [
      'doctorId',
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalSettled']
    ],
    group: ['doctorId'],
    raw: true
  });

  // 4. Combine data
  const report = doctors.map(doc => {
    const earned = parseFloat(earnings.find(e => e.doctorId === doc.id)?.totalEarned || 0);
    const settled = parseFloat(settlements.find(s => s.doctorId === doc.id)?.totalSettled || 0);
    return {
      ...doc,
      totalEarned: earned,
      totalSettled: settled,
      balance: earned - settled
    };
  });

  res.json(report);
});

exports.getDoctorSettlements = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const history = await Settlement.findAll({
    where: { doctorId },
    order: [['date', 'DESC']]
  });
  res.json(history);
});

exports.createSettlement = catchAsync(async (req, res) => {
  const { doctorId, amount, method, reference, remarks } = req.body;
  
  const settlement = await Settlement.create({
    doctorId,
    amount,
    method,
    reference,
    remarks,
    recordedBy: req.user.id
  });

  const doctor = await Doctor.findByPk(doctorId);
  logActivity(req.user.id, 'create', 'Settlement', settlement.id, `Settled ₹${amount} for Dr. ${doctor?.name}`);

  res.status(201).json(settlement);
});
