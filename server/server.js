const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Ensure DB is connected before processing requests in serverless environment
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Database connection failed' });
  }
});

// ── Security Middleware ─────────────────────────────────────────

// Set security HTTP headers with strict CSP and HSTS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "*"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Contact form stricter rate limit
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 1000 : 5,
  message: { success: false, message: 'Too many contact attempts, please try again later.' },
});
app.use('/api/contact', contactLimiter);

// ── CORS ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true, // Reflects the request origin, allowing all domains including Vercel preview URLs
    credentials: true,
  })
);

// ── Body Parsers ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Portfolio API is running 🚀', timestamp: new Date() });
});

// ── API Routes ──────────────────────────────────────────────────
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/skills', require('./routes/skillsRoutes'));
app.use('/api/projects', require('./routes/projectsRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/certifications', require('./routes/certificationRoutes'));
app.use('/api/social-links', require('./routes/socialLinksRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// ── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;
