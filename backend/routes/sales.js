const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - customerName
 *         - status
 *         - paymentStatus
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated order ID
 *         customerName:
 *           type: string
 *           description: Name of the customer
 *         status:
 *           type: string
 *           enum: [pending, completed, shipped, cancelled]
 *           description: Order status
 *         paymentStatus:
 *           type: string
 *           enum: [paid, unpaid, refunded]
 *           description: Payment status
 *         userId:
 *           type: integer
 *           description: ID of the user who created the order
 *         inventoryItemId:
 *           type: integer
 *           description: ID of the inventory item
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Order creation timestamp
 *     Payment:
 *       type: object
 *       required:
 *         - orderId
 *         - amount
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated payment ID
 *         orderId:
 *           type: integer
 *           description: ID of the associated order
 *         amount:
 *           type: number
 *           format: float
 *           description: Payment amount
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: Payment status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Payment creation timestamp
 *     SalesAnalytics:
 *       type: object
 *       properties:
 *         totalSales:
 *           type: number
 *           description: Total sales amount
 *         totalOrders:
 *           type: integer
 *           description: Total number of orders
 *         averageOrderValue:
 *           type: number
 *           description: Average order value
 *         period:
 *           type: string
 *           description: Time period for analytics
 */

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales/orders
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, shipped, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [paid, unpaid, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: customerName
 *         schema:
 *           type: string
 *         description: Filter by customer name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/', authenticateToken, requireRole(['admin', 'sales', 'worker']), async (req, res) => {
  try {
    const { status, paymentStatus, customerName, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (customerName) where.customerName = { contains: customerName, mode: 'insensitive' };

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          inventoryItem: {
            select: { id: true, name: true, model: true, size: true }
          },
          payments: true
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/:id', authenticateToken, requireRole(['admin', 'sales', 'worker']), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        inventoryItem: {
          select: { id: true, name: true, model: true, size: true, stockLevel: true }
        },
        payments: true,
        workerLogs: {
          include: {
            worker: {
              select: { id: true, name: true }
            }
          },
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new order
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - inventoryItemId
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Name of the customer
 *               inventoryItemId:
 *                 type: integer
 *                 description: ID of the inventory item
 *               status:
 *                 type: string
 *                 enum: [pending, completed, shipped]
 *                 default: pending
 *                 description: Order status
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, unpaid]
 *                 default: unpaid
 *                 description: Payment status
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request - Invalid data or insufficient stock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post('/', authenticateToken, requireRole(['admin', 'sales']), async (req, res) => {
  try {
    const { customerName, inventoryItemId, status = 'pending', paymentStatus = 'unpaid' } = req.body;

    // Validate required fields
    if (!customerName || !inventoryItemId) {
      return res.status(400).json({ error: 'Customer name and inventory item ID are required' });
    }

    // Check if inventory item exists and has stock
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(inventoryItemId) }
    });

    if (!inventoryItem) {
      return res.status(400).json({ error: 'Inventory item not found' });
    }

    if (inventoryItem.stockLevel <= 0) {
      return res.status(400).json({ error: 'Insufficient stock for this item' });
    }

    // Create order and update inventory in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          customerName,
          status,
          paymentStatus,
          userId: req.user.id,
          inventoryItemId: parseInt(inventoryItemId)
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          inventoryItem: {
            select: { id: true, name: true, model: true, size: true }
          }
        }
      });

      // Update inventory stock level
      await tx.inventoryItem.update({
        where: { id: parseInt(inventoryItemId) },
        data: { stockLevel: inventoryItem.stockLevel - 1 }
      });

      return order;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Name of the customer
 *               status:
 *                 type: string
 *                 enum: [pending, completed, shipped, cancelled]
 *                 description: Order status
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, unpaid, refunded]
 *                 description: Payment status
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.put('/:id', authenticateToken, requireRole(['admin', 'sales']), async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, status, paymentStatus } = req.body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        ...(customerName && { customerName }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        inventoryItem: {
          select: { id: true, name: true, model: true, size: true }
        },
        payments: true
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete order and restore inventory in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the order (this will cascade delete related records)
      await tx.order.delete({
        where: { id: parseInt(id) }
      });

      // Restore inventory stock if order was not cancelled
      if (existingOrder.status !== 'cancelled') {
        await tx.inventoryItem.update({
          where: { id: existingOrder.inventoryItemId },
          data: {
            stockLevel: {
              increment: 1
            }
          }
        });
      }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

/**
 * @swagger
 * /api/sales/{id}/payments:
 *   post:
 *     summary: Add a payment to an order
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Payment amount
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *                 default: completed
 *                 description: Payment status
 *     responses:
 *       201:
 *         description: Payment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post('/:id/payments', authenticateToken, requireRole(['admin', 'sales']), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status = 'completed' } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(id),
        amount: parseFloat(amount),
        status
      }
    });

    // Update order payment status if payment is completed
    if (status === 'completed') {
      await prisma.order.update({
        where: { id: parseInt(id) },
        data: { paymentStatus: 'paid' }
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

/**
 * @swagger
 * /api/sales/analytics/summary:
 *   get:
 *     summary: Get sales analytics summary
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: month
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Sales analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesAnalytics'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/analytics/summary', authenticateToken, requireRole(['admin', 'sales']), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get analytics data
    const [totalOrders, totalSales] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'cancelled' }
        }
      }),
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'completed'
        },
        _sum: { amount: true }
      })
    ]);

    const totalSalesAmount = totalSales._sum.amount || 0;
    const averageOrderValue = totalOrders > 0 ? totalSalesAmount / totalOrders : 0;

    res.json({
      totalSales: totalSalesAmount,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      period
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

module.exports = router; 