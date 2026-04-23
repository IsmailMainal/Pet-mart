const { Appointment, User, Doctor } = require('../models');
const logActivity = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const { notify, notifyAdmins } = require('../utils/notifier');

exports.getAppointments = catchAsync(async (req, res, next) => {
  const where = req.user.role === 'customer' ? { userId: req.user.id } : {};
  const appointments = await Appointment.findAll({ where, include: [{model: User, as: 'customer'}, Doctor] });
  res.json(appointments);
});

exports.getAppointmentById = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findByPk(req.params.id, { 
    include: [{model: User, as: 'customer'}, Doctor] 
  });
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
  
  if (req.user.role === 'customer' && appointment.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json(appointment);
});

exports.createAppointment = catchAsync(async (req, res, next) => {
  const { doctorId, date, time } = req.body;
  
  // Conflict detection
  const existing = await Appointment.findOne({ 
    where: { doctorId, date, time, status: ['Pending', 'Confirmed'] } 
  });
  
  if (existing) {
    return res.status(400).json({ 
      error: 'Conflict detected', 
      message: 'This doctor is already booked for this time slot.' 
    });
  }

  const appointment = await Appointment.create({
    ...req.body,
    userId: req.user.id,
    status: 'Pending'
  });

  // Notify admins
  await notifyAdmins('New Appointment Request', `New appointment booked by ${req.user.name} for ${req.body.date} at ${req.body.time}`, 'info', '/appointments');
  // Notify customer
  await notify(req.user.id, 'Appointment Booked', `Your appointment for ${req.body.date} at ${req.body.time} has been received and is pending confirmation.`, 'success', '/appointments');

  logActivity(req.user.id, 'create', 'Appointment', appointment.id, `Booked appointment for ${date} at ${time}`);
  res.status(201).json(appointment);
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    console.warn(`[DEBUG] Appointment ${id} not found`);
    return res.status(404).json({ error: 'Not found' });
  }

  // Security: Customers can only update their own appointments
  if (req.user.role === 'customer' && appointment.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied: This is not your appointment' });
  }

  try {
    // Only update fields that are provided
    await appointment.update(req.body);
    
    // Notify customer if status changed
    if (req.body.status && req.body.status !== appointment.status) {
      await notify(appointment.userId, 'Appointment Updated', `Your appointment status has been updated to: ${req.body.status}`, 'info', '/appointments');
    }
    
    logActivity(req.user.id, 'update', 'Appointment', appointment.id, `Updated appointment status to ${req.body.status || appointment.status}`);
    
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

exports.deleteAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findByPk(id);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  // Security: Customers can only delete their own appointments
  if (req.user.role === 'customer' && appointment.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  await appointment.destroy();
  logActivity(req.user.id, 'delete', 'Appointment', id, `Deleted appointment for user ID ${appointment.userId}`);
  res.json({ message: 'Appointment deleted' });
});
