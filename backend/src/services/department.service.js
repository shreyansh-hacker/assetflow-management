const prisma = require('../database');
const { logActivity } = require('../utils/logger');

class DepartmentService {
  async getAll() {
    return prisma.department.findMany();
  }

  async create(data, userId) {
    const department = await prisma.department.create({ data });
    await logActivity(userId, 'CREATE', 'Department', department.id);
    return department;
  }

  async update(id, data, userId) {
    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data
    });
    await logActivity(userId, 'UPDATE', 'Department', department.id);
    return department;
  }

  async delete(id, userId) {
    const departmentId = parseInt(id);
    // Check if users or assets exist
    const users = await prisma.user.count({ where: { departmentId } });
    const assets = await prisma.asset.count({ where: { departmentId } });
    if (users > 0 || assets > 0) {
      throw new Error('Cannot delete department with existing users or assets');
    }

    const deleted = await prisma.department.delete({ where: { id: departmentId } });
    await logActivity(userId, 'DELETE', 'Department', deleted.id);
    return deleted;
  }
}

module.exports = new DepartmentService();
