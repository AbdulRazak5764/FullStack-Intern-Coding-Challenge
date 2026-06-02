const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('Admin@123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      name: 'System Administrator Default',
      email: 'admin@store.com',
      password: pass,
      address: '123 Admin Headquarters, System Lane, Platform City',
      role: 'SYSTEM_ADMIN'
    }
  });
  console.log('Admin user seeded successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
