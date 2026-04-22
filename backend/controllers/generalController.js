const { Service, Doctor } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.getServices = catchAsync(async (req, res, next) => {
  const services = await Service.findAll();
  res.json(services);
});

exports.createService = catchAsync(async (req, res, next) => {
  const service = await Service.create(req.body);
  res.status(201).json(service);
});

exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  await service.update(req.body);
  res.json(service);
});

exports.getDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.findAll();
  res.json(doctors);
});

exports.createDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json(doctor);
});
