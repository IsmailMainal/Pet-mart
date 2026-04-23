const { Service, Doctor, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');

exports.getServices = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows } = await Service.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset
  });

  res.json({
    services: rows,
    meta: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  });
});

exports.getServiceById = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

exports.createService = catchAsync(async (req, res, next) => {
  const { name, description, price } = req.body;
  const service = await Service.create({ name, description, price });
  res.status(201).json(service);
});

exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  
  const { name, description, price } = req.body;
  await service.update({ name, description, price });
  res.json(service);
});

exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  await service.destroy();
  res.json({ message: 'Service deleted' });
});

exports.getDoctors = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { specialization: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows } = await Doctor.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset
  });

  res.json({
    doctors: rows,
    meta: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  });
});

exports.getDoctorById = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

exports.createDoctor = catchAsync(async (req, res, next) => {
  const { name, specialization, email, phone } = req.body;
  const doctor = await Doctor.create({ name, specialization, email, phone });
  res.status(201).json(doctor);
});

exports.updateDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  
  const { name, specialization, email, phone } = req.body;
  await doctor.update({ name, specialization, email, phone });
  res.json(doctor);
});

exports.deleteDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  await doctor.destroy();
  res.json({ message: 'Doctor deleted' });
});
