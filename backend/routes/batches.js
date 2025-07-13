const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// List all batches
router.get('/', async (req, res) => {
  const batches = await prisma.batch.findMany();
  res.json(batches);
});

// Create a new batch
router.post('/', async (req, res) => {
  const { type } = req.body;
  if (!type) return res.status(400).json({ error: 'Type is required' });
  const batch = await prisma.batch.create({ data: { type } });
  res.status(201).json(batch);
});

// Update a batch
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  if (!type) return res.status(400).json({ error: 'Type is required' });
  const batch = await prisma.batch.update({ where: { id: parseInt(id) }, data: { type } });
  res.json(batch);
});

// Delete a batch
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.batch.delete({ where: { id: parseInt(id) } });
  res.json({ success: true });
});

module.exports = router; 