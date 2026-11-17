const express = require('express');
const router = express.Router();

const stationController = require('../controllers/stationController');
const switchController = require('../controllers/switchController');
const assetController = require('../controllers/assetController');
const telemetryController = require('../controllers/telemetryController');
const logController = require('../controllers/logController');
const alertController = require('../controllers/alertController');
const statsController = require('../controllers/statsController');
const authController = require('../controllers/authController');

// Authentication (Admin Security: User 1.9, Password 191)
router.post('/auth/login', authController.login);

// Dashboard Overview Stats
router.get('/stats', statsController.getDashboardStats);

// Stations Routes
router.get('/stations', stationController.getAllStations);
router.get('/stations/:id', stationController.getStationById);

// Switches Routes (DS 1 - DS 20)
router.get('/switches', switchController.getAllSwitches);
router.get('/switches/:id', switchController.getSwitchById);
router.patch('/switches/:id/toggle', switchController.toggleSwitch);
router.patch('/switches/:id/interlock', switchController.toggleInterlock);

// Infrastructure Assets & Sections
router.get('/assets', assetController.getAllAssets);
router.get('/sections', assetController.getAllSections);

// Telemetry & Substations
router.get('/telemetry', telemetryController.getTelemetry);

// Maintenance Logs (Read for all, Create/Update/Delete for Admin)
router.get('/logs', logController.getAllLogs);
router.post('/logs', logController.createLog);
router.put('/logs/:id', logController.updateLog);
router.delete('/logs/:id', logController.deleteLog);
router.post('/logs/:id/delete', logController.deleteLog);
router.post('/logs/delete/:id', logController.deleteLog);

// SCADA Alerts
router.get('/alerts', alertController.getAllAlerts);
router.patch('/alerts/:id/ack', alertController.acknowledgeAlert);

module.exports = router;
