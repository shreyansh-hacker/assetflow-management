const transferService = require('../services/transfer.service');
const { successResponse, errorResponse } = require('../utils/response');

class TransferController {
  async create(req, res) {
    try {
      const result = await transferService.create(req.body, req.user.id);
      return successResponse(res, 'Transfer request created', result, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async approve(req, res) {
    try {
      const result = await transferService.approve(req.params.id, req.user.id);
      return successResponse(res, 'Transfer approved', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async reject(req, res) {
    try {
      const result = await transferService.reject(req.params.id, req.user.id);
      return successResponse(res, 'Transfer rejected', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new TransferController();
