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

// Security HTTP headers - relaxed for development/cross-origin images
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http:", "https:"],
    },
  },
}));

// CORS — allow frontend origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
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
    const syncOptions = process.env.NODE_ENV === 'production' ? { alter: false } : { alter: true };
    
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
