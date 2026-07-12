const prisma = require('../database');
const { logActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notification');

class AllocationService {
  async allocate(data, adminId) {
    const { assetId, userId } = data;
    
    // Check if asset is available
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error('Asset not found');
    if (asset.status !== 'Available') throw new Error(`Asset is currently ${asset.status}`);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const allocation = await prisma.$transaction(async (prisma) => {
      const alloc = await prisma.assetAllocation.create({
        data: {
          assetId,
          userId,
          status: 'Active'
        }
      });

      await prisma.asset.update({
        where: { id: assetId },
        data: { status: 'Allocated' }
      });

      return alloc;
    });

    await logActivity(adminId, 'ALLOCATE', 'Asset', assetId);
    await createNotification(userId, `Asset ${asset.name} has been assigned to you.`);

    return allocation;
  }

  async returnAsset(data, adminId) {
    const { allocationId } = data;

    const allocation = await prisma.assetAllocation.findUnique({ where: { id: allocationId } });
    if (!allocation) throw new Error('Allocation not found');
    if (allocation.status === 'Returned') throw new Error('Asset already returned');

    const result = await prisma.$transaction(async (prisma) => {
      const updatedAlloc = await prisma.assetAllocation.update({
        where: { id: allocationId },
        data: {
          status: 'Returned',
          returnedAt: new Date()
        }
      });

      await prisma.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'Available' }
      });

      return updatedAlloc;
    });

    await logActivity(adminId, 'RETURN', 'Asset', allocation.assetId);
    return result;
  }
}

module.exports = new AllocationService();
