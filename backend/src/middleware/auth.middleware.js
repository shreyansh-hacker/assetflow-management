const jwt = require('jsonwebtoken');
const prisma = require('../database');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Unauthorized', 403);
    }
    
    if (roles.length && !roles.includes(req.user.role.name)) {
      return errorResponse(res, 'Forbidden: Insufficient privileges', 403);
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
