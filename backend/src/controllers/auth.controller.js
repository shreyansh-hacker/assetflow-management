const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async signup(req, res) {
    try {
      const result = await authService.signup(req.body);
      return successResponse(res, 'Signup successful', result, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return successResponse(res, 'Login successful', result);
    } catch (error) {
      return errorResponse(res, error.message, 401);
    }
  }

  async profile(req, res) {
    try {
      const user = await authService.getProfile(req.user.id);
      return successResponse(res, 'Profile fetched', user);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new AuthController();
