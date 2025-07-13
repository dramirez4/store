const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// List all roles
router.get('/', async (req, res) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
});

// Create a new role
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const role = await prisma.role.create({ data: { name } });
  res.status(201).json(role);
});

// Update a role
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const role = await prisma.role.update({ where: { id: parseInt(id) }, data: { name } });
  res.json(role);
});

// Delete a role
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.role.delete({ where: { id: parseInt(id) } });
  res.json({ success: true });
});

module.exports = router; 