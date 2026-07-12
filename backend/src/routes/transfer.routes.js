const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', transferController.create);
router.put('/:id/approve', authorize(['Admin', 'Asset Manager']), transferController.approve);
router.put('/:id/reject', authorize(['Admin', 'Asset Manager']), transferController.reject);

module.exports = router;
