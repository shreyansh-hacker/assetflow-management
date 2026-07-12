const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const departmentRoutes = require('./department.routes');
const categoryRoutes = require('./category.routes');
const employeeRoutes = require('./employee.routes');
const assetRoutes = require('./asset.routes');
const allocationRoutes = require('./allocation.routes');
const transferRoutes = require('./transfer.routes');
const bookingRoutes = require('./booking.routes');
const maintenanceRoutes = require('./maintenance.routes');
const auditRoutes = require('./audit.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');

router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/employees', employeeRoutes);
router.use('/assets', assetRoutes);
router.use('/allocation', allocationRoutes);
router.use('/transfer', transferRoutes);
router.use('/bookings', bookingRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/audits', auditRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
