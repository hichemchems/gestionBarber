import express from 'express';
import { body } from 'express-validator';
import { AdminCharge } from '../models/associations.js';
import { isAuthenticated, requireRole, validateRequest } from '../server.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin-charges:
 *   get:
 *     summary: Get all admin charges
 *     tags: [Admin Charges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin charges
 */
router.get('/', isAuthenticated, requireRole(['admin', 'superAdmin']), async (req, res) => {
  try {
    const adminCharges = await AdminCharge.findAll({
      order: [['year', 'DESC'], ['month', 'DESC']],
    });
    res.json({ adminCharges });
  } catch (error) {
    console.error('Get admin charges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin-charges:
 *   post:
 *     summary: Create a new admin charge
 *     tags: [Admin Charges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *               - year
 *               - amount
 *             properties:
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               year:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Admin charge created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', isAuthenticated, requireRole(['admin', 'superAdmin']), [
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2020 }),
  body('amount').isFloat({ min: 0 }),
], validateRequest, async (req, res) => {
  try {
    const { month, year, amount } = req.body;

    // Check if admin charge already exists for this month/year
    const existingCharge = await AdminCharge.findOne({ where: { month, year } });
    if (existingCharge) {
      return res.status(400).json({ error: 'Admin charge already exists for this month/year' });
    }

    const adminCharge = await AdminCharge.create({
      month,
      year,
      amount,
    });

    res.status(201).json({
      message: 'Admin charge created successfully',
      adminCharge,
    });
  } catch (error) {
    console.error('Create admin charge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin-charges/{id}:
 *   put:
 *     summary: Update admin charge
 *     tags: [Admin Charges]
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
 *               amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Admin charge updated successfully
 *       404:
 *         description: Admin charge not found
 */
router.put('/:id', isAuthenticated, requireRole(['admin', 'superAdmin']), [
  body('amount').isFloat({ min: 0 }),
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const adminCharge = await AdminCharge.findByPk(id);
    if (!adminCharge) {
      return res.status(404).json({ error: 'Admin charge not found' });
    }

    await adminCharge.update({ amount });

    res.json({
      message: 'Admin charge updated successfully',
      adminCharge,
    });
  } catch (error) {
    console.error('Update admin charge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/admin-charges/{id}:
 *   delete:
 *     summary: Delete admin charge
 *     tags: [Admin Charges]
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
 *         description: Admin charge deleted successfully
 *       404:
 *         description: Admin charge not found
 */
router.delete('/:id', isAuthenticated, requireRole(['admin', 'superAdmin']), async (req, res) => {
  try {
    const { id } = req.params;

    const adminCharge = await AdminCharge.findByPk(id);
    if (!adminCharge) {
      return res.status(404).json({ error: 'Admin charge not found' });
    }

    await adminCharge.destroy();

    res.json({ message: 'Admin charge deleted successfully' });
  } catch (error) {
    console.error('Delete admin charge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
