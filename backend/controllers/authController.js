const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/logger');
const { JWT_SECRET } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const { notify, notifyAdmins } = require('../utils/notifier');

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email, isActive: true } });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  logActivity(user.id, 'login', 'User', user.id, 'User logged in');
  
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      role: user.role, 
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage
    } 
  });
});

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, phone } = req.body;
  
  // Validation
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already in use' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await User.create({ 
    name, 
    email, 
    phone,
    password: hashedPassword, 
    role: 'customer',
    profileImage: req.file ? `/uploads/${req.file.filename}` : null
  });
  
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  
  await notify(user.id, 'Welcome to Pets Mart!', 'Thank you for joining our community.', 'success', '/dashboard');
  await notifyAdmins('New Customer Registered', `${user.name} has joined as a customer.`, 'info', '/users');

  logActivity(user.id, 'register', 'User', user.id, 'New customer registered');
  
  res.status(201).json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      role: user.role, 
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage
    } 
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });
  res.json({ user });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    // For security, don't reveal if user exists or not
    return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  }

  // Generate a reset token valid for 1 hour
  const resetToken = jwt.sign({ id: user.id, action: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
  
  // IN PRODUCTION: Send this link via email
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  console.log(`[FORGOT PASSWORD] Reset link for ${email}: ${resetLink}`);

  res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.action !== 'reset') throw new Error('Invalid token type');
    
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    logActivity(user.id, 'update', 'User', user.id, 'Password reset via token');
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired reset token.' });
  }
});
