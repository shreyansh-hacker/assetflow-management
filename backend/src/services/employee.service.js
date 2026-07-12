const prisma = require('../database');
const bcrypt = require('bcrypt');
const { logActivity } = require('../utils/logger');

class EmployeeService {
  async getAll() {
    return prisma.user.findMany({
      include: { role: true, department: true }
    });
  }

  async create(data, userId) {
    const { name, email, password, roleId, departmentId } = data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        departmentId
      }
    });

    await logActivity(userId, 'CREATE', 'Employee', employee.id);
    const { password: _, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
  }

  async update(id, data, userId) {
    const { name, roleId, departmentId } = data;
    const employee = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, roleId, departmentId }
    });

    await logActivity(userId, 'UPDATE', 'Employee', employee.id);
    const { password: _, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
  }
}

module.exports = new EmployeeService();
