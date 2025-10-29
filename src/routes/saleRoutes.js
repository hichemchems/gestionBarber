import express from 'express';
import { body } from 'express-validator';
import { Sale, Package, Employee } from '../models/associations.js';
import { isAuthenticated, requireRole, validateRequest } from '../server.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/sales/employee/{employeeId}:
 *   get:
 *     summary: Get sales for an employee
 *     tags: [Sales]
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
 *         description: List of sales for the employee
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

    const sales = await Sale.findAll({
      where: { employeeId },
      include: [
        { model: Package, as: 'package' },
        { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] },
      ],
      order: [['date', 'DESC']],
    });

    res.json({ sales });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/sales/employee/{employeeId}:
 *   post:
 *     summary: Create a new sale for an employee
 *     tags: [Sales]
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
 *               - packageId
 *               - clientName
 *             properties:
 *               packageId:
 *                 type: integer
 *               clientName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Package or employee not found
 */
router.post('/employee/:employeeId', isAuthenticated, [
  body('packageId').isInt({ min: 1 }),
  body('clientName').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
], validateRequest, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { packageId, clientName, description } = req.body;

    // Check if user can create sales for this employee
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

    // Check if package exists and is active
    const pkg = await Package.findOne({ where: { id: packageId, isActive: true } });
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found or inactive' });
    }

    const sale = await Sale.create({
      employeeId,
      packageId,
      clientName,
      amount: pkg.price,
      description,
    });

    const saleWithDetails = await Sale.findByPk(sale.id, {
      include: [
        { model: Package, as: 'package' },
        { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] },
      ],
    });

    res.status(201).json({
      message: 'Sale created successfully',
      sale: saleWithDetails,
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/sales/employee/{employeeId}/sale/{saleId}:
 *   put:
 *     summary: Update a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: saleId
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
 *         description: Sale updated successfully
 *       404:
 *         description: Sale not found
 */
router.put('/employee/:employeeId/sale/:saleId', isAuthenticated, [
  body('clientName').optional().notEmpty().trim().escape(),
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().trim().escape(),
], validateRequest, async (req, res) => {
  try {
    const { employeeId, saleId } = req.params;
    const updates = req.body;

    // Check if user can update this sale
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const sale = await Sale.findOne({ where: { id: saleId, employeeId } });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    await sale.update(updates);

    const updatedSale = await Sale.findByPk(saleId, {
      include: [
        { model: Package, as: 'package' },
        { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] },
      ],
    });

    res.json({
      message: 'Sale updated successfully',
      sale: updatedSale,
    });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/sales/employee/{employeeId}/sale/{saleId}:
 *   delete:
 *     summary: Delete a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *       404:
 *         description: Sale not found
 */
router.delete('/employee/:employeeId/sale/:saleId', isAuthenticated, async (req, res) => {
  try {
    const { employeeId, saleId } = req.params;

    // Check if user can delete this sale
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const sale = await Sale.findOne({ where: { id: saleId, employeeId } });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    await sale.destroy();

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
