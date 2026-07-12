const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', authorize(['Admin', 'Asset Manager', 'Department Head']), allocationController.allocate);
router.post('/return', authorize(['Admin', 'Asset Manager', 'Department Head']), allocationController.returnAsset);

module.exports = router;
