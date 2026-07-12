const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', assetController.getAll);
router.get('/:id', assetController.getById);
router.post('/', authorize(['Admin', 'Asset Manager', 'Department Head']), assetController.create);
router.put('/:id', authorize(['Admin', 'Asset Manager', 'Department Head']), assetController.update);
router.delete('/:id', authorize(['Admin', 'Asset Manager']), assetController.delete);

module.exports = router;
