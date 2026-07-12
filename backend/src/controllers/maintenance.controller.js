const maintenanceService = require('../services/maintenance.service');
const { successResponse, errorResponse } = require('../utils/response');

class MaintenanceController {
  async getAll(req, res) {
    try {
      const requests = await maintenanceService.getAll();
      return successResponse(res, 'Maintenance requests fetched', requests);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const result = await maintenanceService.create(req.body, req.user.id);
      return successResponse(res, 'Maintenance request created', result, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async approve(req, res) {
    try {
      const result = await maintenanceService.approve(req.params.id, req.user.id);
      return successResponse(res, 'Maintenance approved', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async reject(req, res) {
    try {
      const result = await maintenanceService.reject(req.params.id, req.user.id);
      return successResponse(res, 'Maintenance rejected', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async resolve(req, res) {
    try {
      const result = await maintenanceService.resolve(req.params.id, req.user.id);
      return successResponse(res, 'Maintenance resolved', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new MaintenanceController();
