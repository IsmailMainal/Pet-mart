const { User, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const logActivity = require('../utils/logger');

exports.getUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || 'all';

  const where = {};
  if (role !== 'all') {
    where.role = role;
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });

  res.json({
    users: rows,
    meta: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { password, ...data } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ ...data, password: hashedPassword });
  const userResponse = user.toJSON();
  delete userResponse.password;
  res.status(201).json(userResponse);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { password, ...data } = req.body;
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  await user.update(data);
  const userResponse = user.toJSON();
  delete userResponse.password;
  res.json(userResponse);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (user.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account here. Use deactivation.' });
  }

  await user.destroy();
  res.json({ message: 'User deleted' });
});

exports.getCustomers = catchAsync(async (req, res, next) => {
  const customers = await User.findAll({
    where: { role: 'customer' },
    attributes: ['id', 'name', 'email', 'phone']
  });
  res.json(customers);
});

// Self-service profile management
exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  const { name, phone, password, confirmPassword } = req.body;

  const updateData = { name, phone };

  if (password) {
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    updateData.password = await bcrypt.hash(password, 10);
  }

  if (req.file) {
    updateData.profileImage = `/uploads/${req.file.filename}`;
  }

  await user.update(updateData);
  logActivity(user.id, 'update', 'User', user.id, 'User updated their profile');
  
  const updatedUser = user.toJSON();
  delete updatedUser.password;
  res.json({ user: updatedUser });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  await user.update({ isActive: false });
  logActivity(user.id, 'delete', 'User', user.id, 'User deactivated their account');
  res.json({ message: 'Account deactivated' });
});
