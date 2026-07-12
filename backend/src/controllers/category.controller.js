const categoryService = require('../services/category.service');
const { successResponse, errorResponse } = require('../utils/response');

class CategoryController {
  async getAll(req, res) {
    try {
      const categories = await categoryService.getAll();
      return successResponse(res, 'Categories fetched successfully', categories);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const category = await categoryService.create(req.body, req.user.id);
      return successResponse(res, 'Category created', category, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new CategoryController();
