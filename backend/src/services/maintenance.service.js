const prisma = require('../database');
const { logActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notification');

class MaintenanceService {
  async getAll() {
    return prisma.maintenanceRequest.findMany({ include: { asset: true, user: true } });
  }

  async create(data, userId) {
    const { assetId, issue } = data;
    
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error('Asset not found');

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        requestedBy: userId,
        issue,
        status: 'Pending'
      }
    });

    await logActivity(userId, 'CREATE', 'MaintenanceRequest', request.id);
    return request;
  }

  async approve(id, userId) {
    const req = await prisma.maintenanceRequest.findUnique({ where: { id: parseInt(id) } });
    if (!req) throw new Error('Request not found');

    const result = await prisma.$transaction(async (prisma) => {
      const updatedReq = await prisma.maintenanceRequest.update({
        where: { id: parseInt(id) },
        data: { status: 'Approved' }
      });

      await prisma.asset.update({
        where: { id: req.assetId },
        data: { status: 'Under Maintenance' }
      });

      return updatedReq;
    });

    await logActivity(userId, 'APPROVE', 'MaintenanceRequest', req.id);
    await createNotification(req.requestedBy, `Maintenance for asset ${req.assetId} approved.`);

    return result;
  }

  async reject(id, userId) {
    const req = await prisma.maintenanceRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'Rejected', resolvedAt: new Date() }
    });

    await logActivity(userId, 'REJECT', 'MaintenanceRequest', req.id);
    await createNotification(req.requestedBy, `Maintenance for asset ${req.assetId} rejected.`);
    return req;
  }

  async resolve(id, userId) {
    const req = await prisma.maintenanceRequest.findUnique({ where: { id: parseInt(id) } });
    if (!req) throw new Error('Request not found');

    const result = await prisma.$transaction(async (prisma) => {
      const updatedReq = await prisma.maintenanceRequest.update({
        where: { id: parseInt(id) },
        data: { status: 'Resolved', resolvedAt: new Date() }
      });

      await prisma.asset.update({
        where: { id: req.assetId },
        data: { status: 'Available' }
      });

      return updatedReq;
    });

    await logActivity(userId, 'RESOLVE', 'MaintenanceRequest', req.id);
    await createNotification(req.requestedBy, `Maintenance for asset ${req.assetId} is resolved.`);
    return result;
  }
}

module.exports = new MaintenanceService();
