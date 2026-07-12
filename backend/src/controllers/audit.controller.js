const auditService = require('../services/audit.service');
const { successResponse, errorResponse } = require('../utils/response');

class AuditController {
  async getAll(req, res) {
    try {
      const audits = await auditService.getAll();
      return successResponse(res, 'Audits fetched', audits);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const result = await auditService.create(req.body, req.user.id);
      return successResponse(res, 'Audit cycle created', result, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async verify(req, res) {
    try {
      const result = await auditService.verify(req.params.id, req.body, req.user.id);
      return successResponse(res, 'Asset verified in audit', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async close(req, res) {
    try {
      const result = await auditService.close(req.params.id, req.user.id);
      return successResponse(res, 'Audit cycle closed', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new AuditController();
