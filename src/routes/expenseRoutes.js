import express from 'express';
import { body } from 'express-validator';
import { Expense, User } from '../models/associations.js';
import { isAuthenticated, requireRole, validateRequest } from '../server.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get('/', isAuthenticated, requireRole(['admin', 'superAdmin']), async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      include: [{ model: User, as: 'creator' }],
      order: [['date', 'DESC']],
    });
    res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - amount
 *             properties:
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', isAuthenticated, [
  body('category').notEmpty().trim().escape(),
  body('amount').isFloat({ min: 0 }),
  body('description').optional().trim().escape(),
], validateRequest, async (req, res) => {
  try {
    const { category, amount, description } = req.body;

    const expense = await Expense.create({
      category,
      amount,
      description,
      createdBy: req.user.id,
    });

    const expenseWithCreator = await Expense.findByPk(expense.id, {
      include: [{ model: User, as: 'creator' }],
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense: expenseWithCreator,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 */
router.put('/:id', isAuthenticated, [
  body('category').optional().notEmpty().trim().escape(),
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().trim().escape(),
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check if user can update this expense (creator or admin)
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin' && expense.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await expense.update(updates);

    const updatedExpense = await Expense.findByPk(id, {
      include: [{ model: User, as: 'creator' }],
    });

    res.json({
      message: 'Expense updated successfully',
      expense: updatedExpense,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check if user can delete this expense (creator or admin)
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin' && expense.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
