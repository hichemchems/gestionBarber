import express from 'express';
import { body } from 'express-validator';
import path from 'path';
import { User, Employee } from '../models/associations.js';
import { hashPassword } from '../lib/auth.js';
import { isAuthenticated, requireRole, validateRequest } from '../server.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
router.get('/', isAuthenticated, requireRole(['admin', 'superAdmin']), async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Employee, as: 'employee' }],
      attributes: { exclude: ['passwordHash'] },
    });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user (barber)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - name
 *               - position
 *               - hireDate
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               hireDate:
 *                 type: string
 *                 format: date
 *               deductionPercentage:
 *                 type: number
 *               avatar:
 *                 type: string
 *                 format: binary
 *               contract:
 *                 type: string
 *                 format: binary
 *               employmentDeclaration:
 *                 type: string
 *                 format: binary
 *               certification:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', isAuthenticated, requireRole(['admin', 'superAdmin']), [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 14 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('name').notEmpty().trim().escape(),
  body('position').notEmpty().trim().escape(),
  body('hireDate').isISO8601(),
  body('deductionPercentage').optional().isFloat({ min: 0, max: 100 }),
], validateRequest, async (req, res) => {
  try {
    const { username, email, password, name, position, hireDate, deductionPercentage = 0 } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Handle file uploads
    let avatarPath = null;
    let contractPath = null;
    let employmentDeclarationPath = null;
    let certificationPath = null;

    if (req.files) {
      const uploadDir = path.join(process.cwd(), 'uploads');

      if (req.files.avatar) {
        const avatar = req.files.avatar;
        avatarPath = `avatar_${Date.now()}_${avatar.name}`;
        await avatar.mv(path.join(uploadDir, avatarPath));
      }

      if (req.files.contract) {
        const contract = req.files.contract;
        contractPath = `contract_${Date.now()}_${contract.name}`;
        await contract.mv(path.join(uploadDir, contractPath));
      }

      if (req.files.employmentDeclaration) {
        const employmentDeclaration = req.files.employmentDeclaration;
        employmentDeclarationPath = `employment_declaration_${Date.now()}_${employmentDeclaration.name}`;
        await employmentDeclaration.mv(path.join(uploadDir, employmentDeclarationPath));
      }

      if (req.files.certification) {
        const certification = req.files.certification;
        certificationPath = `certification_${Date.now()}_${certification.name}`;
        await certification.mv(path.join(uploadDir, certificationPath));
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash,
      role: 'user',
      avatar: avatarPath,
    });

    // Create employee
    const employee = await Employee.create({
      userId: user.id,
      name,
      position,
      hireDate,
      deductionPercentage,
      contract: contractPath,
      employmentDeclaration: employmentDeclarationPath,
      certification: certificationPath,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        employee,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [superAdmin, admin, user]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', isAuthenticated, requireRole(['admin', 'superAdmin']), [
  body('username').optional().isLength({ min: 3 }).trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['superAdmin', 'admin', 'user']),
  body('isActive').optional().isBoolean(),
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update(updates);

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}/deduction-percentage:
 *   put:
 *     summary: Update employee deduction percentage
 *     tags: [Users]
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
 *             required:
 *               - deductionPercentage
 *             properties:
 *               deductionPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Deduction percentage updated successfully
 *       404:
 *         description: Employee not found
 */
router.put('/:id/deduction-percentage', isAuthenticated, requireRole(['admin', 'superAdmin']), [
  body('deductionPercentage').isFloat({ min: 0, max: 100 }),
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { deductionPercentage } = req.body;

    const employee = await Employee.findOne({ where: { userId: id } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await employee.update({ deductionPercentage });

    res.json({
      message: 'Deduction percentage updated successfully',
      employee: {
        id: employee.id,
        userId: employee.userId,
        deductionPercentage: employee.deductionPercentage,
      },
    });
  } catch (error) {
    console.error('Update deduction percentage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', isAuthenticated, requireRole(['superAdmin']), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
