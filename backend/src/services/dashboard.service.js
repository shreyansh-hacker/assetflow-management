const prisma = require('../database');

class DashboardService {
  async getKPIs() {
    const availableAssets = await prisma.asset.count({ where: { status: 'Available' } });
    const allocatedAssets = await prisma.asset.count({ where: { status: 'Allocated' } });
    
    // Maintenance Today (created today or resolved today, let's say currently Under Maintenance or Pending requests from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maintenanceToday = await prisma.maintenanceRequest.count({
      where: {
        requestedAt: { gte: today }
      }
    });

    const activeBookings = await prisma.booking.count({ where: { status: 'Active' } });
    const pendingTransfers = await prisma.transferRequest.count({ where: { status: 'Pending' } });
    
    // Upcoming Returns (allocations that are active, maybe without a strict due date, but let's just return a placeholder or based on active bookings ending soon)
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    const upcomingReturns = await prisma.booking.count({
      where: {
        status: 'Active',
        endDate: { lte: in3Days }
      }
    });

    return {
      availableAssets,
      allocatedAssets,
      maintenanceToday,
      upcomingReturns,
      activeBookings,
      pendingTransfers
    };
  }
}

module.exports = new DashboardService();
