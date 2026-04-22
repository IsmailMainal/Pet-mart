const { Notification, User } = require('../models');

const notify = async (userId, title, message, type = 'info', link = null) => {
  try {
    await Notification.create({ userId, title, message, type, link });
  } catch (err) {
    console.error('Notification failed:', err);
  }
};

const notifyAdmins = async (title, message, type = 'info', link = null) => {
  try {
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await notify(admin.id, title, message, type, link);
    }
  } catch (err) {
    console.error('Admin notification failed:', err);
  }
};

module.exports = { notify, notifyAdmins };
