const departmentService = require('../services/department.service');
const { successResponse, errorResponse } = require('../utils/response');

class DepartmentController {
  async getAll(req, res) {
    try {
      const departments = await departmentService.getAll();
      return successResponse(res, 'Departments fetched successfully', departments);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const department = await departmentService.create(req.body, req.user.id);
      return successResponse(res, 'Department created', department, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const department = await departmentService.update(req.params.id, req.body, req.user.id);
      return successResponse(res, 'Department updated', department);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await departmentService.delete(req.params.id, req.user.id);
      return successResponse(res, 'Department deleted');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new DepartmentController();
