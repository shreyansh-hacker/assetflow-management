const notificationService = require('../services/notification.service');
const { successResponse, errorResponse } = require('../utils/response');

class NotificationController {
  async getAll(req, res) {
    try {
      const notifications = await notificationService.getAllForUser(req.user.id);
      return successResponse(res, 'Notifications fetched successfully', notifications);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async markRead(req, res) {
    try {
      const result = await notificationService.markAsRead(req.params.id, req.user.id);
      return successResponse(res, 'Notification marked as read', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async markAllRead(req, res) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      return successResponse(res, 'All notifications marked as read', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new NotificationController();
