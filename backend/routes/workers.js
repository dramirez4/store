const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const router = express.Router();
const prisma = new PrismaClient();

// List all workers
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({ include: { role: true } });
  res.json(users);
});

// Create a new worker
router.post('/', async (req, res) => {
  const { name, email, password, roleId } = req.body;
  if (!name || !email || !password || !roleId) return res.status(400).json({ error: 'All fields are required' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashedPassword, roleId: parseInt(roleId) } });
  res.status(201).json(user);
});

// Update a worker
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, roleId } = req.body;
  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 10);
  if (roleId) data.roleId = parseInt(roleId);
  const user = await prisma.user.update({ where: { id: parseInt(id) }, data });
  res.json(user);
});

// Delete a worker
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: parseInt(id) } });
  res.json({ success: true });
});

module.exports = router; 