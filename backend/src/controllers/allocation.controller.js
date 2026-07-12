const allocationService = require('../services/allocation.service');
const { successResponse, errorResponse } = require('../utils/response');

class AllocationController {
  async allocate(req, res) {
    try {
      const result = await allocationService.allocate(req.body, req.user.id);
      return successResponse(res, 'Asset allocated successfully', result, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async returnAsset(req, res) {
    try {
      const result = await allocationService.returnAsset(req.body, req.user.id);
      return successResponse(res, 'Asset returned successfully', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new AllocationController();
