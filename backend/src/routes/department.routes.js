const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', departmentController.getAll);
router.post('/', authorize('Admin'), departmentController.create);
router.put('/:id', authorize('Admin'), departmentController.update);
router.delete('/:id', authorize('Admin'), departmentController.delete);

module.exports = router;
