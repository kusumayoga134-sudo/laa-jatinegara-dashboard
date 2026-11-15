const express = require('express');
const router = express.Router();

const stationController = require('../controllers/stationController');
const switchController = require('../controllers/switchController');
const assetController = require('../controllers/assetController');
const telemetryController = require('../controllers/telemetryController');
const logController = require('../controllers/logController');
const alertController = require('../controllers/alertController');
const statsController = require('../controllers/statsController');

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

// Maintenance Logs
router.get('/logs', logController.getAllLogs);
router.post('/logs', logController.createLog);

// SCADA Alerts
router.get('/alerts', alertController.getAllAlerts);
router.patch('/alerts/:id/ack', alertController.acknowledgeAlert);

module.exports = router;
