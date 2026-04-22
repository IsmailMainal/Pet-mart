const { Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 50
  });
  res.json(notifications);
});

exports.markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Notification.update({ isRead: true }, {
    where: { id, userId: req.user.id }
  });
  res.json({ message: 'Marked as read' });
});

exports.clearNotifications = catchAsync(async (req, res) => {
  await Notification.destroy({
    where: { userId: req.user.id }
  });
  res.json({ message: 'Notifications cleared' });
});
