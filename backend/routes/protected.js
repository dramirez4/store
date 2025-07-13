const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { 
  authenticateToken, 
  requireAdmin, 
  requireWorker, 
  requireSales, 
  requireRole 
} = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/protected/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Protected Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/protected/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Protected Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: Access token required
 *       403:
 *         description: Admin access required
 */
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/protected/worker/inventory:
 *   get:
 *     summary: Get inventory items (Worker or Admin)
 *     tags: [Protected Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inventory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       model:
 *                         type: string
 *                       size:
 *                         type: string
 *                       stockLevel:
 *                         type: integer
 *       401:
 *         description: Access token required
 *       403:
 *         description: Worker or admin access required
 */
router.get('/worker/inventory', authenticateToken, requireWorker, async (req, res) => {
  try {
    const inventory = await prisma.inventoryItem.findMany();
    res.json({ inventory });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/protected/sales/orders:
 *   get:
 *     summary: Get orders (Sales or Admin)
 *     tags: [Protected Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       customerName:
 *                         type: string
 *                       status:
 *                         type: string
 *                       paymentStatus:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Access token required
 *       403:
 *         description: Sales or admin access required
 */
router.get('/sales/orders', authenticateToken, requireSales, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        inventoryItem: { select: { name: true, model: true } },
        payments: true
      }
    });
    
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/protected/management/dashboard:
 *   get:
 *     summary: Get management dashboard stats (Admin or Sales)
 *     tags: [Protected Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     totalInventory:
 *                       type: integer
 *                     totalPayments:
 *                       type: integer
 *       401:
 *         description: Access token required
 *       403:
 *         description: Admin or sales access required
 */
router.get('/management/dashboard', authenticateToken, requireRole(['admin', 'sales']), async (req, res) => {
  try {
    const stats = {
      totalUsers: await prisma.user.count(),
      totalOrders: await prisma.order.count(),
      totalInventory: await prisma.inventoryItem.count(),
      totalPayments: await prisma.payment.count()
    };
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 