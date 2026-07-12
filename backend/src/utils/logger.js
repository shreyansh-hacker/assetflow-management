const prisma = require('../database');

const logActivity = async (userId, action, entity, entityId) => {
  try {
    if (!userId) return; // Ignore system actions if userId is not provided
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };
