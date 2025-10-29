import express from 'express';
import { Op } from 'sequelize';
import { Sale, Receipt, Expense, Salary, Employee, Package, AdminCharge } from '../models/associations.js';
import { isAuthenticated, requireRole } from '../server.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 */
router.get('/dashboard', isAuthenticated, requireRole(['admin', 'superAdmin']), async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get current month data
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    // Total sales this month
    const totalSales = await Sale.sum('amount', {
      where: {
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    }) || 0;

    // Total receipts this month
    const totalReceipts = await Receipt.sum('amount', {
      where: {
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    }) || 0;

    // Total expenses this month
    const totalExpenses = await Expense.sum('amount', {
      where: {
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    }) || 0;

    // Total salaries this month
    const totalSalaries = await Salary.sum('totalSalary', {
      where: {
        periodStart: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    }) || 0;

    // Admin charges this month
    const adminCharge = await AdminCharge.findOne({
      where: { month: currentMonth, year: currentYear },
    });
    const totalAdminCharges = adminCharge ? parseFloat(adminCharge.amount) : 0;

    // Net profit calculation
    const netProfit = totalSales + totalReceipts - totalExpenses - totalSalaries - totalAdminCharges;

    // Employee performance (top 5)
    const employeePerformance = await Employee.findAll({
      include: [
        {
          model: Sale,
          as: 'sales',
          where: {
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          required: false,
        },
        {
          model: Receipt,
          as: 'receipts',
          where: {
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          required: false,
        },
      ],
      attributes: ['id', 'name'],
    });

    const performanceData = employeePerformance.map(emp => ({
      id: emp.id,
      name: emp.name,
      totalSales: emp.sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0),
      totalReceipts: emp.receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0),
      total: emp.sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0) +
             emp.receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0),
    })).sort((a, b) => b.total - a.total).slice(0, 5);

    // Popular packages
    const popularPackages = await Package.findAll({
      include: [
        {
          model: Sale,
          as: 'sales',
          where: {
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          required: false,
        },
      ],
      attributes: ['id', 'name', 'price'],
    });

    const packageData = popularPackages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      salesCount: pkg.sales.length,
      totalRevenue: pkg.sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0),
    })).sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

    res.json({
      currentMonth: {
        totalSales,
        totalReceipts,
        totalExpenses,
        totalSalaries,
        totalAdminCharges,
        netProfit,
      },
      employeePerformance: performanceData,
      popularPackages: packageData,
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of months to look back
 *     responses:
 *       200:
 *         description: Revenue analytics data
 */
router.get('/revenue', isAuthenticated, requireRole(['admin', 'superAdmin']), async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      const sales = await Sale.sum('amount', {
        where: {
          date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      }) || 0;

      const receipts = await Receipt.sum('amount', {
        where: {
          date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      }) || 0;

      const expenses = await Expense.sum('amount', {
        where: {
          date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      }) || 0;

      data.push({
        month: `${year}-${month.toString().padStart(2, '0')}`,
        sales,
        receipts,
        expenses,
        totalRevenue: sales + receipts,
      });
    }

    res.json({ revenue: data });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
