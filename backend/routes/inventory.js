const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin, requireWorker } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inventory:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryItem'
 *       401:
 *         description: Access token required
 *       403:
 *         description: Unauthorized access
 */
router.get('/', authenticateToken, requireWorker, async (req, res) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json({ inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       404:
 *         description: Inventory item not found
 *       401:
 *         description: Access token required
 *       403:
 *         description: Unauthorized access
 */
router.get('/:id', authenticateToken, requireWorker, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create new inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - model
 *               - size
 *               - stockLevel
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name
 *               model:
 *                 type: string
 *                 description: Item model
 *               size:
 *                 type: string
 *                 description: Item size
 *               stockLevel:
 *                 type: integer
 *                 minimum: 0
 *                 description: Initial stock level
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Access token required
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, model, size, stockLevel } = req.body;

    // Validate input
    if (!name || !model || !size || stockLevel === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (stockLevel < 0) {
      return res.status(400).json({ error: 'Stock level cannot be negative' });
    }

    // Check if item already exists
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        name,
        model,
        size
      }
    });

    if (existingItem) {
      return res.status(400).json({ error: 'Item with this name, model, and size already exists' });
    }

    // Create new inventory item
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        model,
        size,
        stockLevel
      }
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name
 *               model:
 *                 type: string
 *                 description: Item model
 *               size:
 *                 type: string
 *                 description: Item size
 *               stockLevel:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock level
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Inventory item not found
 *       401:
 *         description: Access token required
 *       403:
 *         description: Admin access required
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, size, stockLevel } = req.body;

    // Validate input
    if (stockLevel !== undefined && stockLevel < 0) {
      return res.status(400).json({ error: 'Stock level cannot be negative' });
    }

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Check for duplicate if name/model/size is being changed
    if (name || model || size) {
      const duplicateItem = await prisma.inventoryItem.findFirst({
        where: {
          name: name || existingItem.name,
          model: model || existingItem.model,
          size: size || existingItem.size,
          id: { not: parseInt(id) }
        }
      });

      if (duplicateItem) {
        return res.status(400).json({ error: 'Item with this name, model, and size already exists' });
      }
    }

    // Update inventory item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(model && { model }),
        ...(size && { size }),
        ...(stockLevel !== undefined && { stockLevel })
      }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
 *       400:
 *         description: Cannot delete item with associated orders
 *       401:
 *         description: Access token required
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: true
      }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Check if item has associated orders
    if (existingItem.orders.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete inventory item with associated orders' 
      });
    }

    // Delete inventory item
    await prisma.inventoryItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/inventory/{id}/stock:
 *   patch:
 *     summary: Update stock level (Admin/Worker)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stockLevel
 *             properties:
 *               stockLevel:
 *                 type: integer
 *                 minimum: 0
 *                 description: New stock level
 *     responses:
 *       200:
 *         description: Stock level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Inventory item not found
 *       401:
 *         description: Access token required
 *       403:
 *         description: Unauthorized access
 */
router.patch('/:id/stock', authenticateToken, requireWorker, async (req, res) => {
  try {
    const { id } = req.params;
    const { stockLevel } = req.body;

    // Validate input
    if (stockLevel === undefined || stockLevel < 0) {
      return res.status(400).json({ error: 'Valid stock level is required' });
    }

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Update stock level
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: parseInt(id) },
      data: { stockLevel }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update stock level error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 