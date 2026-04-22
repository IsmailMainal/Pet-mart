const { ActivityLog, User } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.getLogs = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const { count, rows } = await ActivityLog.findAndCountAll({
    include: [{ model: User, attributes: ['name', 'email'], required: false }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.json({
    logs: rows,
    meta: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  });
});
