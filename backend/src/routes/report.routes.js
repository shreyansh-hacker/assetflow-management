const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorize(['Admin', 'Asset Manager', 'Department Head']));

router.get('/assets', reportController.getAssets);
router.get('/utilization', reportController.getUtilization);
router.get('/maintenance', reportController.getMaintenance);

module.exports = router;
