const prisma = require('../database');
const { logActivity } = require('../utils/logger');

class CategoryService {
  async getAll() {
    return prisma.category.findMany();
  }

  async create(data, userId) {
    const category = await prisma.category.create({ data });
    await logActivity(userId, 'CREATE', 'Category', category.id);
    return category;
  }
}

module.exports = new CategoryService();
