const prisma = require('../database');
const { logActivity } = require('../utils/logger');

class AuditService {
  async getAll() {
    return prisma.auditCycle.findMany({ include: { items: true } });
  }

  async create(data, userId) {
    const { name, startDate } = data;
    const cycle = await prisma.auditCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        status: 'Open'
      }
    });

    // Optionally generate AuditItems for all assets, but usually done per asset during verification
    await logActivity(userId, 'CREATE', 'AuditCycle', cycle.id);
    return cycle;
  }

  async verify(id, data, userId) {
    const { assetId, status } = data; // status: Verified, Missing, Lost

    const cycle = await prisma.auditCycle.findUnique({ where: { id: parseInt(id) } });
    if (!cycle || cycle.status !== 'Open') {
      throw new Error('Audit cycle is not open or not found');
    }

    const item = await prisma.auditItem.create({
      data: {
        auditCycleId: cycle.id,
        assetId,
        status,
        verifiedAt: new Date()
      }
    });

    if (status === 'Lost') {
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: 'Lost' }
      });
    }

    await logActivity(userId, 'VERIFY', 'Asset', assetId);
    return item;
  }

  async close(id, userId) {
    const cycle = await prisma.auditCycle.update({
      where: { id: parseInt(id) },
      data: { status: 'Closed', endDate: new Date() }
    });

    await logActivity(userId, 'CLOSE', 'AuditCycle', cycle.id);
    // Notification logic can be added here
    return cycle;
  }
}

module.exports = new AuditService();
