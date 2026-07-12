const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding database...');
  
  const roles = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@assetflow.com',
      password: hashedPassword,
      roleId: adminRole.id
    }
  });

  const itDept = await prisma.department.upsert({
    where: { name: 'IT' },
    update: {},
    create: { name: 'IT' }
  });

  await prisma.category.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: { name: 'Laptops' }
  });

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
