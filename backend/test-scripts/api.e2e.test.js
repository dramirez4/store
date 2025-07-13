const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let testRole, testWorker, testBatch, testLog;

beforeAll(async () => {
  // Clean up test data if exists
  await prisma.workerLog.deleteMany({});
  await prisma.user.deleteMany({ where: { email: 'testworker@example.com' } });
  await prisma.role.deleteMany({ where: { name: 'TestRole' } });
  await prisma.batch.deleteMany({ where: { type: 'TestBatch' } });
});

describe('Roles API', () => {
  it('should create a role', async () => {
    const res = await request(app).post('/api/roles').send({ name: 'TestRole' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('TestRole');
    testRole = res.body;
  });
  it('should list roles', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('should update a role', async () => {
    const res = await request(app).put(`/api/roles/${testRole.id}`).send({ name: 'TestRoleUpdated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('TestRoleUpdated');
    testRole = res.body;
  });
  it('should delete a role', async () => {
    const res = await request(app).delete(`/api/roles/${testRole.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Workers API', () => {
  beforeAll(async () => {
    // Re-create test role for worker
    testRole = await prisma.role.create({ data: { name: 'TestRole' } });
  });
  it('should create a worker', async () => {
    const res = await request(app).post('/api/workers').send({ name: 'Test Worker', email: 'testworker@example.com', password: 'testpass', roleId: testRole.id });
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('testworker@example.com');
    testWorker = res.body;
  });
  it('should list workers', async () => {
    const res = await request(app).get('/api/workers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('should update a worker', async () => {
    const res = await request(app).put(`/api/workers/${testWorker.id}`).send({ name: 'Test Worker Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Worker Updated');
    testWorker = res.body;
  });
  it('should delete a worker', async () => {
    const res = await request(app).delete(`/api/workers/${testWorker.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Batches API', () => {
  it('should create a batch', async () => {
    const res = await request(app).post('/api/batches').send({ type: 'TestBatch' });
    expect(res.statusCode).toBe(201);
    expect(res.body.type).toBe('TestBatch');
    testBatch = res.body;
  });
  it('should list batches', async () => {
    const res = await request(app).get('/api/batches');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('should update a batch', async () => {
    const res = await request(app).put(`/api/batches/${testBatch.id}`).send({ type: 'TestBatchUpdated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe('TestBatchUpdated');
    testBatch = res.body;
  });
  it('should delete a batch', async () => {
    const res = await request(app).delete(`/api/batches/${testBatch.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

const uniqueSuffix = Date.now();

describe('Worker Logs API', () => {
  beforeAll(async () => {
    // Re-create test role, worker, and batch for logs
    testRole = await prisma.role.create({ data: { name: `TestRole-Logs-${uniqueSuffix}` } });
    testWorker = await prisma.user.create({ data: { name: 'Test Worker', email: `testworker-${uniqueSuffix}@example.com`, password: 'testpass', roleId: testRole.id } });
    testBatch = await prisma.batch.create({ data: { type: `TestBatch-Logs-${uniqueSuffix}` } });
  });
  it('should log worker activity', async () => {
    const res = await request(app).post('/api/worker-logs').send({ workerId: testWorker.id, roleId: testRole.id, batchId: testBatch.id, quantity: 5 });
    expect(res.statusCode).toBe(201);
    expect(res.body.quantity).toBe(5);
    testLog = res.body;
  });
  it('should list logs', async () => {
    const res = await request(app).get('/api/worker-logs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('should get stats', async () => {
    const res = await request(app).get('/api/worker-logs/stats?groupBy=workerId');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('QR API', () => {
  beforeAll(async () => {
    testBatch = await prisma.batch.create({ data: { type: 'TestBatch' } });
  });
  it('should generate a QR code for a batch', async () => {
    const res = await request(app).get(`/api/qr/${testBatch.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.qr).toMatch(/^data:image\/png;base64/);
  });
});

afterAll(async () => {
  // Clean up test data
  await prisma.workerLog.deleteMany({});
  await prisma.user.deleteMany({ where: { email: 'testworker@example.com' } });
  await prisma.role.deleteMany({ where: { name: { contains: 'TestRole' } } });
  await prisma.batch.deleteMany({ where: { type: { contains: 'TestBatch' } } });
  await prisma.$disconnect();
}); 