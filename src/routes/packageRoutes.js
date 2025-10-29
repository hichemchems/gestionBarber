import express from 'express';
import { body } from 'express-validator';
import { Package } from '../models/associations.js';
import { isAuthenticated, requireRole, validateRequest } from '../server.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/packages:
 *   get:
 *     summary: Get all active packages
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active packages
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const packages = await Package.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
    res.json({ packages });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/packages:
 *   post:
 *     summary: Create a new package
 *     tags: [Packages]
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Package created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', isAuthenticated, requireRole(['admin', 'superAdmin']), [
  body('name').notEmpty().trim().escape(),
  body('price').isFloat({ min: 0 }),
], validateRequest, async (req, res) => {
  try {
    const { name, price } = req.body;

    const pkg = await Package.create({
      name,
      price,
    });

    res.status(201).json({
      message: 'Package created successfully',
      package: pkg,
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/packages/{id}:
 *   put:
 *     summary: Update package
 *     tags: [Packages]
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
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Package updated successfully
 *       404:
 *         description: Package not found
 */
router.put('/:id', isAuthenticated, requireRole(['admin', 'superAdmin']), [
  body('name').optional().notEmpty().trim().escape(),
  body('price').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean(),
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    await pkg.update(updates);

    res.json({
      message: 'Package updated successfully',
      package: pkg,
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/packages/{id}:
 *   delete:
 *     summary: Deactivate package
 *     tags: [Packages]
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
 *         description: Package deactivated successfully
 *       404:
 *         description: Package not found
 */
router.delete('/:id', isAuthenticated, requireRole(['admin', 'superAdmin']), async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    await pkg.update({ isActive: false });

    res.json({ message: 'Package deactivated successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
