const { ActivityLog } = require('../models');

const logActivity = async (userId, action, entity, entityId, details) => {
  try {
    await ActivityLog.create({ userId, action, entity, entityId, details });
  } catch (err) {
    console.error('Failed to log activity', err);
  }
};

module.exports = logActivity;
