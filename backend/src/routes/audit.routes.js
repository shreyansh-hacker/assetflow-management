const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorize(['Admin', 'Asset Manager']), auditController.getAll);
router.post('/', authorize(['Admin', 'Asset Manager']), auditController.create);
router.post('/:id/verify', authorize(['Admin', 'Asset Manager']), auditController.verify);
router.post('/:id/close', authorize(['Admin', 'Asset Manager']), auditController.close);

module.exports = router;
