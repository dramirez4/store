const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpass', // In production, use hashed passwords!
      role: 'admin',
    },
  });
  const worker = await prisma.user.upsert({
    where: { email: 'worker@example.com' },
    update: {},
    create: {
      name: 'Worker User',
      email: 'worker@example.com',
      password: 'workerpass',
      role: 'worker',
    },
  });
  const sales = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      name: 'Sales User',
      email: 'sales@example.com',
      password: 'salespass',
      role: 'sales',
    },
  });

  // Create inventory items
  let item1 = await prisma.inventoryItem.findFirst({ where: { name: 'Sneaker X' } });
  if (!item1) {
    item1 = await prisma.inventoryItem.create({
      data: {
        name: 'Sneaker X',
        model: 'X100',
        size: '10',
        stockLevel: 50,
      },
    });
  }
  let item2 = await prisma.inventoryItem.findFirst({ where: { name: 'Boot Y' } });
  if (!item2) {
    item2 = await prisma.inventoryItem.create({
      data: {
        name: 'Boot Y',
        model: 'Y200',
        size: '9',
        stockLevel: 30,
      },
    });
  }

  // Create an order
  const order = await prisma.order.create({
    data: {
      customerName: 'John Doe',
      status: 'pending',
      paymentStatus: 'unpaid',
      user: { connect: { id: sales.id } },
      inventoryItem: { connect: { id: item1.id } },
      createdAt: new Date(),
    },
  });

  // Create a payment
  await prisma.payment.create({
    data: {
      order: { connect: { id: order.id } },
      amount: 120.0,
      status: 'pending',
      createdAt: new Date(),
    },
  });

  // Create a worker log
  await prisma.workerLog.create({
    data: {
      worker: { connect: { id: worker.id } },
      order: { connect: { id: order.id } },
      action: 'scanned',
      timestamp: new Date(),
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 