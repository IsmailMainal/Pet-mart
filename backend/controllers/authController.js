const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/logger');
const { JWT_SECRET } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const { notify, notifyAdmins } = require('../utils/notifier');

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  logActivity(user.id, 'login', 'User', user.id, 'User logged in');
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // Public signup is ONLY for customers.
  // Admins/Staff must be created by an existing Admin in the Staff Management panel.
  const user = await User.create({ name, email, password: hashedPassword, role: 'customer' });
  
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  
  await notify(user.id, 'Welcome to Pets Mart!', 'Thank you for joining our community. We are excited to help you care for your pets.', 'success', '/dashboard');
  await notifyAdmins('New Customer Registered', `${user.name} has joined as a customer.`, 'info', '/users');

  logActivity(user.id, 'register', 'User', user.id, 'New customer registered');
  res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

exports.getMe = (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, role: req.user.role, email: req.user.email } });
};
