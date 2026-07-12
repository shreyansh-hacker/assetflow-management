const prisma = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async signup(data) {
    const { name, email, password, roleName, departmentId } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const role = await prisma.role.findUnique({ where: { name: roleName || 'Employee' } });
    if (!role) {
      throw new Error('Invalid role');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
        departmentId: departmentId || null
      }
    });

    const token = this.generateToken(user);
    delete user.password;
    return { user, token };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { role: true, department: true }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    delete user.password;
    return { user, token };
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, department: true }
    });
    if (user) delete user.password;
    return user;
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role?.name },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1d' }
    );
  }
}

module.exports = new AuthService();
