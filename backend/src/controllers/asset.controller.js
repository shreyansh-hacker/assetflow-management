const assetService = require('../services/asset.service');
const { successResponse, errorResponse } = require('../utils/response');

class AssetController {
  async getAll(req, res) {
    try {
      const assets = await assetService.getAll(req.query);
      return successResponse(res, 'Assets fetched successfully', assets);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const asset = await assetService.getById(req.params.id);
      return successResponse(res, 'Asset fetched successfully', asset);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async create(req, res) {
    try {
      const asset = await assetService.create(req.body, req.user.id);
      return successResponse(res, 'Asset created', asset, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const asset = await assetService.update(req.params.id, req.body, req.user.id);
      return successResponse(res, 'Asset updated', asset);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await assetService.delete(req.params.id, req.user.id);
      return successResponse(res, 'Asset deleted');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new AssetController();
