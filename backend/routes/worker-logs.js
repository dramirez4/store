const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Log worker activity
router.post('/', async (req, res) => {
  const { workerId, roleId, batchId, quantity } = req.body;
  if (!workerId || !roleId || !batchId) return res.status(400).json({ error: 'workerId, roleId, and batchId are required' });
  const log = await prisma.workerLog.create({ data: { workerId: parseInt(workerId), roleId: parseInt(roleId), batchId: parseInt(batchId), quantity: quantity ? parseInt(quantity) : 1 } });
  res.status(201).json(log);
});

// List logs (with filters)
router.get('/', async (req, res) => {
  const { workerId, roleId, batchId, start, end } = req.query;
  const where = {};
  if (workerId) where.workerId = parseInt(workerId);
  if (roleId) where.roleId = parseInt(roleId);
  if (batchId) where.batchId = parseInt(batchId);
  if (start || end) where.timestamp = {};
  if (start) where.timestamp.gte = new Date(start);
  if (end) where.timestamp.lte = new Date(end);
  const logs = await prisma.workerLog.findMany({ where, include: { worker: true, role: true, batch: true } });
  res.json(logs);
});

// Get stats (aggregate by worker, role, batch)
router.get('/stats', async (req, res) => {
  const { groupBy = 'workerId', start, end } = req.query;
  const where = {};
  if (start || end) where.timestamp = {};
  if (start) where.timestamp.gte = new Date(start);
  if (end) where.timestamp.lte = new Date(end);
  let groupField = groupBy;
  if (!['workerId', 'roleId', 'batchId'].includes(groupField)) groupField = 'workerId';
  const stats = await prisma.workerLog.groupBy({
    by: [groupField],
    where,
    _sum: { quantity: true },
    _count: { _all: true }
  });
  res.json(stats);
});

module.exports = router; 