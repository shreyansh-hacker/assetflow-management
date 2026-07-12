const prisma = require('../database');

const createNotification = async (userId, message) => {
  try {
    if (!userId) return;
    await prisma.notification.create({
      data: {
        userId,
        message
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = { createNotification };
