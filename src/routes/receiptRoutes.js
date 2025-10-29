import express from 'express';
import { body } from 'express-validator';
import { Receipt, Employee } from '../models/associations.js';
import { isAuthenticated, requireRole, validateRequest } from '../server.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/receipts/employee/{employeeId}:
 *   get:
 *     summary: Get receipts for an employee
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of receipts for the employee
 *       404:
 *         description: Employee not found
 */
router.get('/employee/:employeeId', isAuthenticated, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if user can access this employee's data
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const receipts = await Receipt.findAll({
      where: { employeeId },
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }],
      order: [['date', 'DESC']],
    });

    res.json({ receipts });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/receipts/employee/{employeeId}:
 *   post:
 *     summary: Add a receipt for an employee
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - amount
 *             properties:
 *               clientName:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Receipt added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Employee not found
 */
router.post('/employee/:employeeId', isAuthenticated, [
  body('clientName').notEmpty().trim().escape(),
  body('amount').isFloat({ min: 0 }),
  body('description').optional().trim().escape(),
], validateRequest, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { clientName, amount, description } = req.body;

    // Check if user can add receipts for this employee
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const receipt = await Receipt.create({
      employeeId,
      clientName,
      amount,
      description,
    });

    const receiptWithDetails = await Receipt.findByPk(receipt.id, {
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }],
    });

    res.status(201).json({
      message: 'Receipt added successfully',
      receipt: receiptWithDetails,
    });
  } catch (error) {
    console.error('Add receipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/receipts/employee/{employeeId}/receipt/{receiptId}:
 *   put:
 *     summary: Update a receipt
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: receiptId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientName:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Receipt updated successfully
 *       404:
 *         description: Receipt not found
 */
router.put('/employee/:employeeId/receipt/:receiptId', isAuthenticated, [
  body('clientName').optional().notEmpty().trim().escape(),
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().trim().escape(),
], validateRequest, async (req, res) => {
  try {
    const { employeeId, receiptId } = req.params;
    const updates = req.body;

    // Check if user can update this receipt
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const receipt = await Receipt.findOne({ where: { id: receiptId, employeeId } });
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    await receipt.update(updates);

    const updatedReceipt = await Receipt.findByPk(receiptId, {
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }],
    });

    res.json({
      message: 'Receipt updated successfully',
      receipt: updatedReceipt,
    });
  } catch (error) {
    console.error('Update receipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/receipts/employee/{employeeId}/receipt/{receiptId}:
 *   delete:
 *     summary: Delete a receipt
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: receiptId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Receipt deleted successfully
 *       404:
 *         description: Receipt not found
 */
router.delete('/employee/:employeeId/receipt/:receiptId', isAuthenticated, async (req, res) => {
  try {
    const { employeeId, receiptId } = req.params;

    // Check if user can delete this receipt
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const receipt = await Receipt.findOne({ where: { id: receiptId, employeeId } });
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    await receipt.destroy();

    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Delete receipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
