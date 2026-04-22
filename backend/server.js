require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http:", "https:"],
    },
  },
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Stricter rate limit for Auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Increased from 10
  message: { error: 'Too many login attempts, please try again in an hour.' },
  skip: (req) => req.method === 'OPTIONS',
});
app.use('/api/auth/', authLimiter);

// CORS — allow frontend origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://pet-shop-xa1r.onrender.com',
  'https://pet-shop-xa1r.vercel.app',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 || 
      (origin.endsWith('.vercel.app') && origin.includes('pet-shop')) || 
      process.env.NODE_ENV === 'development'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsers FIRST — before rate limiter & routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically with explicit CORS and Resource Policy headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// API Routes
app.use('/api', routes);

// 404 catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Database Sync & Server Start
const startServer = async () => {
  try {
    // In production, 'alter: true' can be dangerous. Consider migrations instead.
    // For now, we'll keep it but wrap it in a safer check.
    // DISABLING 'alter: true' as it causes redundant index creation (Too many keys error)
    // Use migrations for schema changes.
    const syncOptions = { alter: false };
    
    console.log('🔄  Syncing database...');
    await sequelize.sync(syncOptions);
    console.log('✅  Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`✅  Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (err) {
    console.error('❌  Server startup failed:', err.message);
    if (err.name === 'SequelizeConnectionError') {
      console.error('👉  Check if your database server (MySQL) is running.');
    }
    // Don't exit(1) immediately in dev if it's just a sync error, 
    // but here it's fatal for the app logic.
    process.exit(1);
  }
};

// Export the app for Vercel
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}
