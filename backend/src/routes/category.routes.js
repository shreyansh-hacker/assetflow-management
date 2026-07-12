const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', categoryController.getAll);
router.post('/', authorize('Admin'), categoryController.create);

module.exports = router;
