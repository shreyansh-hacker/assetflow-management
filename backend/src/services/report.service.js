const prisma = require('../database');

class ReportService {
  async getAssetReport() {
    // Total assets grouped by status
    const statusCounts = await prisma.asset.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    const categoryCounts = await prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true }
    });
    
    return { statusCounts, categoryCounts };
  }

  async getUtilizationReport() {
    const allocations = await prisma.assetAllocation.findMany({
      include: { asset: true, user: true }
    });
    const bookings = await prisma.booking.findMany({
      include: { asset: true, user: true }
    });

    return { totalAllocations: allocations.length, totalBookings: bookings.length, allocations, bookings };
  }

  async getMaintenanceReport() {
    const requests = await prisma.maintenanceRequest.findMany({
      include: { asset: true }
    });
    
    const byStatus = await prisma.maintenanceRequest.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    return { totalRequests: requests.length, byStatus, requests };
  }
}

module.exports = new ReportService();
