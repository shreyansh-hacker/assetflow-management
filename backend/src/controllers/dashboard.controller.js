const dashboardService = require('../services/dashboard.service');
const { successResponse, errorResponse } = require('../utils/response');

class DashboardController {
  async getDashboard(req, res) {
    try {
      const data = await dashboardService.getKPIs();
      return successResponse(res, 'Dashboard data fetched', data);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new DashboardController();
