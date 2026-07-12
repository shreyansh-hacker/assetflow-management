const employeeService = require('../services/employee.service');
const { successResponse, errorResponse } = require('../utils/response');

class EmployeeController {
  async getAll(req, res) {
    try {
      const employees = await employeeService.getAll();
      return successResponse(res, 'Employees fetched successfully', employees);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const employee = await employeeService.create(req.body, req.user.id);
      return successResponse(res, 'Employee created', employee, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const employee = await employeeService.update(req.params.id, req.body, req.user.id);
      return successResponse(res, 'Employee updated', employee);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new EmployeeController();
