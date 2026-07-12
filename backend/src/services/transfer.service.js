const prisma = require('../database');
const { logActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notification');

class TransferService {
  async create(data, userId) {
    const { assetId, toUserId } = data;
    
    // Find active allocation for this asset
    const allocation = await prisma.assetAllocation.findFirst({
      where: { assetId, status: 'Active' }
    });

    if (!allocation || allocation.userId !== userId) {
      throw new Error('You do not have active allocation for this asset');
    }

    const request = await prisma.transferRequest.create({
      data: {
        assetId,
        fromUserId: userId,
        toUserId,
        status: 'Pending'
      }
    });

    await logActivity(userId, 'CREATE', 'TransferRequest', request.id);
    await createNotification(toUserId, `User wants to transfer asset to you. Request ID: ${request.id}`);

    return request;
  }

  async approve(id, userId) {
    const request = await prisma.transferRequest.findUnique({ where: { id: parseInt(id) } });
    if (!request) throw new Error('Transfer request not found');
    if (request.status !== 'Pending') throw new Error(`Request is already ${request.status}`);
    
    // Ensure the approver is an Admin or Asset Manager, or it's a direct approval by the recipient? 
    // The requirements say "Transfer requires approval". We will assume Admin/Manager approves it.
    
    const result = await prisma.$transaction(async (prisma) => {
      const updatedReq = await prisma.transferRequest.update({
        where: { id: parseInt(id) },
        data: { status: 'Approved', resolvedAt: new Date() }
      });

      // End previous allocation
      await prisma.assetAllocation.updateMany({
        where: { assetId: request.assetId, userId: request.fromUserId, status: 'Active' },
        data: { status: 'Returned', returnedAt: new Date() }
      });

      // Create new allocation
      await prisma.assetAllocation.create({
        data: {
          assetId: request.assetId,
          userId: request.toUserId,
          status: 'Active'
        }
      });

      return updatedReq;
    });

    await logActivity(userId, 'APPROVE', 'TransferRequest', request.id);
    await createNotification(request.fromUserId, `Transfer of asset ${request.assetId} approved.`);
    await createNotification(request.toUserId, `Transfer of asset ${request.assetId} approved. It is now allocated to you.`);

    return result;
  }

  async reject(id, userId) {
    const request = await prisma.transferRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'Rejected', resolvedAt: new Date() }
    });

    await logActivity(userId, 'REJECT', 'TransferRequest', request.id);
    await createNotification(request.fromUserId, `Transfer of asset ${request.assetId} was rejected.`);

    return request;
  }
}

module.exports = new TransferService();
