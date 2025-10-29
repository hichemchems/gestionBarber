import express from 'express';
import { body } from 'express-validator';
import { Op } from 'sequelize';
import { Salary, Employee, Sale, Receipt, AdminCharge } from '../models/associations.js';
import { isAuthenticated, requireRole, validateRequest } from '../server.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/salaries/employee/{employeeId}:
 *   get:
 *     summary: Get salaries for an employee
 *     tags: [Salaries]
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
 *         description: List of salaries for the employee
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

    const salaries = await Salary.findAll({
      where: { employeeId },
      include: [{ model: Employee, as: 'employee' }],
      order: [['periodEnd', 'DESC']],
    });

    res.json({ salaries });
  } catch (error) {
    console.error('Get salaries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/salaries/generate:
 *   post:
 *     summary: Generate salaries for all employees
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - periodStart
 *               - periodEnd
 *             properties:
 *               periodStart:
 *                 type: string
 *                 format: date
 *               periodEnd:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Salaries generated successfully
 */
router.post('/generate', isAuthenticated, requireRole(['admin', 'superAdmin']), [
  body('periodStart').isISO8601(),
  body('periodEnd').isISO8601(),
], validateRequest, async (req, res) => {
  try {
    const { periodStart, periodEnd } = req.body;

    const employees = await Employee.findAll();
    const generatedSalaries = [];

    for (const employee of employees) {
      // Calculate total receipts for the period
      const receipts = await Receipt.findAll({
        where: {
          employeeId: employee.id,
          date: {
            [Op.between]: [periodStart, periodEnd],
          },
        },
      });

      const totalReceipts = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0);

      // Calculate total sales for the period
      const sales = await Sale.findAll({
        where: {
          employeeId: employee.id,
          date: {
            [Op.between]: [periodStart, periodEnd],
          },
        },
      });

      const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);

      // Get admin charges for the period
      const adminCharges = await AdminCharge.findOne({
        where: {
          month: new Date(periodStart).getMonth() + 1,
          year: new Date(periodStart).getFullYear(),
        },
      });

      // Calculate deduction
      const deductionAmount = (totalReceipts + totalSales) * (employee.deductionPercentage / 100);

      // Calculate total salary (receipts + sales - deductions)
      const totalSalary = totalReceipts + totalSales - deductionAmount;

      const salary = await Salary.create({
        employeeId: employee.id,
        baseSalary: totalReceipts + totalSales,
        commissionPercentage: employee.deductionPercentage,
        totalSalary: Math.max(0, totalSalary), // Ensure non-negative
        periodStart,
        periodEnd,
      });

      generatedSalaries.push(salary);
    }

    res.status(201).json({
      message: 'Salaries generated successfully',
      salaries: generatedSalaries,
    });
  } catch (error) {
    console.error('Generate salaries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
