const prisma = require('../database');
const { logActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notification');

class BookingService {
  async getAll() {
    return prisma.booking.findMany({ include: { asset: true, user: true } });
  }

  async create(data, userId) {
    const { assetId, startDate, endDate } = data;
    
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error('Start date must be before end date');
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error('Asset not found');
    if (asset.status === 'Under Maintenance' || asset.status === 'Lost' || asset.status === 'Retired' || asset.status === 'Disposed') {
      throw new Error(`Cannot book asset. Current status: ${asset.status}`);
    }

    // Check for overlap
    const overlap = await prisma.booking.findFirst({
      where: {
        assetId,
        status: 'Active',
        OR: [
          { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }
        ]
      }
    });

    if (overlap) {
      throw new Error('Overlapping booking exists for this asset in the given date range');
    }

    const booking = await prisma.booking.create({
      data: {
        assetId,
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'Active'
      }
    });

    await logActivity(userId, 'CREATE', 'Booking', booking.id);
    await createNotification(userId, `Booking for asset ${asset.name} created successfully.`);

    return booking;
  }

  async update(id, data, userId) {
    // Basic update logic (e.g. extending end date) requires overlap check again
    const { endDate } = data;
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { endDate: new Date(endDate) }
    });
    return booking;
  }

  async delete(id, userId) {
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'Cancelled' }
    });
    
    await logActivity(userId, 'CANCEL', 'Booking', booking.id);
    return booking;
  }
}

module.exports = new BookingService();
