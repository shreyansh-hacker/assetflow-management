const prisma = require('../database');

class NotificationService {
  async getAllForUser(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: {
        id: parseInt(id),
        userId
      },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}

module.exports = new NotificationService();
