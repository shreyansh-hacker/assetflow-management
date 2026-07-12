const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorize(['Admin', 'Asset Manager']), maintenanceController.getAll);
router.post('/', maintenanceController.create);
router.put('/:id/approve', authorize(['Admin', 'Asset Manager']), maintenanceController.approve);
router.put('/:id/reject', authorize(['Admin', 'Asset Manager']), maintenanceController.reject);
router.put('/:id/resolve', authorize(['Admin', 'Asset Manager']), maintenanceController.resolve);

module.exports = router;
