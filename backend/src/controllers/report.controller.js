const reportService = require('../services/report.service');
const { successResponse, errorResponse } = require('../utils/response');

class ReportController {
  async getAssets(req, res) {
    try {
      const data = await reportService.getAssetReport();
      return successResponse(res, 'Asset report fetched', data);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getUtilization(req, res) {
    try {
      const data = await reportService.getUtilizationReport();
      return successResponse(res, 'Utilization report fetched', data);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getMaintenance(req, res) {
    try {
      const data = await reportService.getMaintenanceReport();
      return successResponse(res, 'Maintenance report fetched', data);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new ReportController();
