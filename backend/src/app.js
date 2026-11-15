const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'UPT Resor LAA 1.9 Jatinegara API',
    version: '1.0.0',
    description: 'REST API untuk SCADA & Monitoring Listrik Aliran Atas KAI',
    endpoints: {
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
