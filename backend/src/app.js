const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/api');

const app = express();

// Konfigurasi CORS: mendukung FRONTEND_URL dari env (dipisah koma), localhost, dan *.vercel.app
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti curl, mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive agar preview deploy Vercel tidak terblokir
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS

app.use(express.json());

// Redirect root to /api
app.get('/', (req, res) => {
  res.redirect('/api');
});

// Health Check Endpoint untuk Render / Railway / Uptime monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'UPT Resor LAA 1.9 Jatinegara Backend',
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'UPT Resor LAA 1.9 Jatinegara API',
    version: '1.0.0',
    description: 'REST API untuk SCADA & Monitoring Listrik Aliran Atas KAI',
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      stations: '/api/stations',
      switches: '/api/switches',
      assets: '/api/assets',
      sections: '/api/sections',
      telemetry: '/api/telemetry',
      logs: '/api/logs',
      alerts: '/api/alerts',
    },
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Serve frontend dist static files if built
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

module.exports = app;
