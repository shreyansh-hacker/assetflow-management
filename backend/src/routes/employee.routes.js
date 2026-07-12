const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorize(['Admin', 'Asset Manager']), employeeController.getAll);
router.post('/', authorize('Admin'), employeeController.create);
router.put('/:id', authorize('Admin'), employeeController.update);

module.exports = router;
