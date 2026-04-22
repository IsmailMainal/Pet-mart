const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ error: 'Unauthorized: Account is inactive or does not exist' });
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

module.exports = { authenticate, authorize, JWT_SECRET };
