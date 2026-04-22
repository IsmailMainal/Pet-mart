const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const logActivity = require('../utils/logger');

// Only admins & receptionists — never customers
const STAFF_ROLES = ['admin', 'receptionist'];

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    where: { role: { [Op.in]: STAFF_ROLES } },
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });
  res.json(users);
});

exports.getCustomers = catchAsync(async (req, res, next) => {
  const customers = await User.findAll({
    where: { role: 'customer' },
    attributes: { exclude: ['password'] },
    order: [['name', 'ASC']],
  });
  res.json(customers);
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Allow creating both staff and customers
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role });
  logActivity(req.user.id, 'create', 'User', user.id, `Created ${role} account: ${user.email}`);

  const userObj = user.toJSON();
  delete userObj.password;
  res.status(201).json(userObj);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Allow editing all account types (Admin/Staff/Customer)

  const updateData = { name: req.body.name, email: req.body.email, role: req.body.role };
  if (req.body.password) {
    updateData.password = bcrypt.hashSync(req.body.password, 10);
  }

  await user.update(updateData);
  logActivity(req.user.id, 'update', 'User', user.id, `Updated user ${user.email}`);

  const userObj = user.toJSON();
  delete userObj.password;
  res.json(userObj);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Allow deleting all account types

  await user.destroy();
  logActivity(req.user.id, 'delete', 'User', user.id, `Deleted user ${user.email}`);
  res.json({ message: 'Deleted' });
});
