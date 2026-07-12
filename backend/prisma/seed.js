const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding database with full dummy data...');

  // 1. Seed Roles
  const rolesList = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];
  const roles = {};
  for (const name of rolesList) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('Roles seeded.');

  // 2. Seed Departments
  const departmentsList = ['IT', 'HR', 'Finance', 'Operations', 'Marketing'];
  const departments = {};
  for (const name of departmentsList) {
    departments[name] = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('Departments seeded.');

  // 3. Seed Categories
  const categoriesList = ['Laptops', 'Monitors', 'Furniture', 'Software', 'Vehicles'];
  const categories = {};
  for (const name of categoriesList) {
    categories[name] = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('Categories seeded.');

  // 4. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@assetflow.com',
      password: passwordHash,
      roleId: roles['Admin'].id,
      departmentId: departments['IT'].id
    }
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@assetflow.com' },
    update: {},
    create: {
      name: 'Sarah Jenkins',
      email: 'manager@assetflow.com',
      password: passwordHash,
      roleId: roles['Asset Manager'].id,
      departmentId: departments['IT'].id
    }
  });

  const head = await prisma.user.upsert({
    where: { email: 'head@assetflow.com' },
    update: {},
    create: {
      name: 'Robert Davis',
      email: 'head@assetflow.com',
      password: passwordHash,
      roleId: roles['Department Head'].id,
      departmentId: departments['Marketing'].id
    }
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@assetflow.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'employee@assetflow.com',
      password: passwordHash,
      roleId: roles['Employee'].id,
      departmentId: departments['IT'].id
    }
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'jane.smith@assetflow.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@assetflow.com',
      password: passwordHash,
      roleId: roles['Employee'].id,
      departmentId: departments['HR'].id
    }
  });
  console.log('Users seeded.');

  // 5. Seed Assets
  const assetsData = [
    { name: 'MacBook Pro 16"', assetCode: 'AF-LP-0001', serialNumber: 'C02F9988Q05D', status: 'Allocated', categoryName: 'Laptops', departmentName: 'IT' },
    { name: 'Dell UltraSharp 27"', assetCode: 'AF-MN-0002', serialNumber: 'CN099882231A', status: 'Available', categoryName: 'Monitors', departmentName: 'IT' },
    { name: 'Ergonomic Desk Chair', assetCode: 'AF-FN-0003', serialNumber: 'FN77112233AA', status: 'Available', categoryName: 'Furniture', departmentName: 'HR' },
    { name: 'Adobe Creative Suite', assetCode: 'AF-SW-0004', serialNumber: 'AD-9988-7766', status: 'Available', categoryName: 'Software', departmentName: 'Marketing' },
    { name: 'Logistics Courier Van', assetCode: 'AF-VH-0005', serialNumber: 'VN-8877-2211', status: 'Under Maintenance', categoryName: 'Vehicles', departmentName: 'Operations' },
    { name: 'ThinkPad T14 Gen 4', assetCode: 'AF-LP-0006', serialNumber: 'PF44556677BB', status: 'Available', categoryName: 'Laptops', departmentName: 'IT' }
  ];

  const assets = [];
  for (const a of assetsData) {
    const asset = await prisma.asset.upsert({
      where: { assetCode: a.assetCode },
      update: { status: a.status },
      create: {
        name: a.name,
        assetCode: a.assetCode,
        serialNumber: a.serialNumber,
        status: a.status,
        categoryId: categories[a.categoryName].id,
        departmentId: departments[a.departmentName].id
      }
    });
    assets.push(asset);
  }
  console.log('Assets seeded.');

  // 6. Seed Asset Allocation (Active allocation for MacBook Pro to John Doe)
  const macbook = assets.find(a => a.assetCode === 'AF-LP-0001');
  const allocation = await prisma.assetAllocation.create({
    data: {
      assetId: macbook.id,
      userId: employee.id,
      status: 'Active'
    }
  });
  console.log('Allocation seeded.');

  // 7. Seed Booking (Booking for Dell UltraSharp by Jane Smith)
  const dell = assets.find(a => a.assetCode === 'AF-MN-0002');
  const booking = await prisma.booking.create({
    data: {
      assetId: dell.id,
      userId: employee2.id,
      startDate: new Date(Date.now() + 24 * 3600000), // tomorrow
      endDate: new Date(Date.now() + 28 * 3600000),
      status: 'Active'
    }
  });
  console.log('Booking seeded.');

  // 8. Seed Maintenance Request (Logistics Courier Van under maintenance)
  const van = assets.find(a => a.assetCode === 'AF-VH-0005');
  const maint = await prisma.maintenanceRequest.create({
    data: {
      assetId: van.id,
      requestedBy: employee.id,
      issue: 'Routine 50k miles engine oil change and brake pad check.',
      status: 'Approved' // approved sets it under maintenance
    }
  });
  console.log('Maintenance request seeded.');

  // 9. Seed Transfer Request (Pending transfer request for Dell UltraSharp to Sarah Jenkins)
  const transfer = await prisma.transferRequest.create({
    data: {
      assetId: dell.id,
      fromUserId: employee.id,
      toUserId: manager.id,
      status: 'Pending'
    }
  });
  console.log('Transfer request seeded.');

  // 10. Seed Audit Cycle & Items
  const cycle = await prisma.auditCycle.create({
    data: {
      name: 'Q3 Inventory Audit',
      startDate: new Date(),
      status: 'Open'
    }
  });

  for (const a of assets) {
    await prisma.auditItem.create({
      data: {
        auditCycleId: cycle.id,
        assetId: a.id,
        status: a.status === 'Lost' ? 'Lost' : 'Verified',
        verifiedAt: new Date()
      }
    });
  }
  console.log('Audit cycle and items seeded.');

  // 11. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: employee.id,
      message: 'System: Welcome to your AssetFlow console.',
      isRead: false
    }
  });
  await prisma.notification.create({
    data: {
      userId: admin.id,
      message: 'Maintenance: Ticket MNT-3001 created for Logistics Courier Van.',
      isRead: false
    }
  });
  console.log('Notifications seeded.');

  // 12. Seed Activity Logs
  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: 'SEED',
      entity: 'Database',
      entityId: 0
    }
  });
  console.log('Activity logs seeded.');

  console.log('Full seeding process completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
