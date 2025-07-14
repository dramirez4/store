const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('adminpass', saltRounds);
  const workerPassword = await bcrypt.hash('workerpass', saltRounds);
  const salesPassword = await bcrypt.hash('salespass', saltRounds);

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });
  const workerRole = await prisma.role.upsert({
    where: { name: 'worker' },
    update: {},
    create: { name: 'worker' },
  });
  const salesRole = await prisma.role.upsert({
    where: { name: 'sales' },
    update: {},
    create: { name: 'sales' },
  });
  console.log('Roles:', { adminRole, workerRole, salesRole });

  // Create users with roleId
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      roleId: adminRole.id,
    },
  });
  const worker = await prisma.user.upsert({
    where: { email: 'worker@example.com' },
    update: {},
    create: {
      name: 'Worker User',
      email: 'worker@example.com',
      password: workerPassword,
      roleId: workerRole.id,
    },
  });
  const sales = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      name: 'Sales User',
      email: 'sales@example.com',
      password: salesPassword,
      roleId: salesRole.id,
    },
  });
  console.log('Users:', { admin, worker, sales });

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
  console.log('Inventory Items:', { item1, item2 });

  // Create a batch
  const batch = await prisma.batch.create({
    data: {
      type: 'sole',
      createdAt: new Date(),
    },
  });
  console.log('Batch:', batch);

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
  console.log('Order:', order);

  // Create a payment
  const payment = await prisma.payment.create({
    data: {
      order: { connect: { id: order.id } },
      amount: 120.0,
      status: 'pending',
      createdAt: new Date(),
    },
  });
  console.log('Payment:', payment);

  // Create a worker log (with roleId and batchId)
  const workerLog = await prisma.workerLog.create({
    data: {
      worker: { connect: { id: worker.id } },
      order: { connect: { id: order.id } },
      role: { connect: { id: workerRole.id } },
      batch: { connect: { id: batch.id } },
      quantity: 10,
      timestamp: new Date(),
    },
  });
  console.log('WorkerLog:', workerLog);

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