const prisma = require('../database');
const { logActivity } = require('../utils/logger');

class AssetService {
  async getAll(filters = {}) {
    const { status, departmentId, search } = filters;
    const where = {};
    if (status) where.status = status;
    if (departmentId) where.departmentId = parseInt(departmentId);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    return prisma.asset.findMany({
      where,
      include: { category: true, department: true }
    });
  }

  async getById(id) {
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id) },
      include: { category: true, department: true, allocations: true, bookings: true, maintenanceReqs: true }
    });
    if (!asset) throw new Error('Asset not found');
    return asset;
  }

  async create(data, userId) {
    const { name, assetCode, serialNumber, categoryId, departmentId } = data;
    
    const existingCode = await prisma.asset.findUnique({ where: { assetCode } });
    if (existingCode) throw new Error('Asset code already exists');
    
    const existingSerial = await prisma.asset.findUnique({ where: { serialNumber } });
    if (existingSerial) throw new Error('Serial number already exists');

    const asset = await prisma.asset.create({
      data: {
        name,
        assetCode,
        serialNumber,
        status: 'Available',
        categoryId,
        departmentId
      }
    });

    await logActivity(userId, 'CREATE', 'Asset', asset.id);
    return asset;
  }

  async update(id, data, userId) {
    const assetId = parseInt(id);
    const asset = await prisma.asset.update({
      where: { id: assetId },
      data
    });

    await logActivity(userId, 'UPDATE', 'Asset', asset.id);
    return asset;
  }

  async delete(id, userId) {
    const assetId = parseInt(id);
    // Ensure no active allocations or bookings
    const activeAlloc = await prisma.assetAllocation.count({ where: { assetId, status: 'Active' } });
    if (activeAlloc > 0) throw new Error('Cannot delete asset with active allocations');
    
    const asset = await prisma.asset.delete({ where: { id: assetId } });
    await logActivity(userId, 'DELETE', 'Asset', asset.id);
    return asset;
  }
}

module.exports = new AssetService();
