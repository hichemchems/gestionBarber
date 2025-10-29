"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const csurf = require("csurf");
const expressValidator = require("express-validator");
const path = require("path");
const dotenv = require("dotenv");
const sequelize$1 = require("sequelize");
const jwt = require("jsonwebtoken");
require("jwt-decode");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
require("bcryptjs");
const crypto = require("node:crypto");
dotenv.config();
const server = {
  url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3e3}`,
  host: process.env.HOST || "0.0.0.0",
  port: process.env.PORT || 3e3,
  secure: process.env.SECURE || false,
  cors: process.env.CORS || ""
};
const database = {
  dialect: process.env.DATABASE_DIALECT || "mysql",
  database: process.env.DATABASE_DBNAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  ssl: process.env.DATABASE_SSL || false
};
const auth = {
  accessToken: {
    type: process.env.ACCESS_TOKEN_TYPE || "Bearer",
    algorithm: process.env.ACCESS_TOKEN_ALGORITHM || "HS256",
    secret: process.env.ACCESS_TOKEN_SECRET || "Acc3ssTok3nS3c3t!",
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN_MS || 60 * 60 * 1e3,
    // 60 minutes
    audience: process.env.ACCESS_TOKEN_AUDIENCE || "my_backend_api",
    // Audience claim of the JWT
    issuer: process.env.ACCESS_TOKEN_ISSUER || "my_authentication_server"
    // Issuer claim of the JWT
  },
  crypto: {
    scrypt: {
      saltLength: process.env.SCRYPT_SALT_LENGTH || 16,
      // 16-bytes salt
      hashLength: process.env.SCRYPT_HASH_LENGTH || 64,
      // 64 characters hash
      cost: process.env.SCRYPT_COST || Math.pow(2, 17),
      // amount of CPU/memory used
      blockSize: process.env.SCRYPT_BLOCK_SIZE || 8,
      // 1024 bytes memory blocks
      parallelization: process.env.SCRYPT_PARALLELIZATION || 1,
      // nb of concurrent threads
      maxmem: process.env.SCRYPT_MAXMEM | 134220800
      // maximum memory used by the algorithm. Slightly above 128MB (ie, 128 * blockSize * cost * parallelization = 134,217,728 bytes)
    },
    unsaltedHashAlgorithm: process.env.FAST_HASH_ALGORITHM || "sha256"
  }
};
const config = {
  auth,
  database,
  server
};
const sequelize = new sequelize$1.Sequelize(
  config.database.database,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    ssl: config.database.ssl,
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);
const User$1 = sequelize.define("User", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: sequelize$1.DataTypes.ENUM("superAdmin", "admin", "user"),
    defaultValue: "user"
  },
  avatar: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: sequelize$1.DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "users"
});
const Employee = sequelize.define("Employee", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  name: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false
  },
  hireDate: {
    type: sequelize$1.DataTypes.DATE,
    allowNull: false
  },
  deductionPercentage: {
    type: sequelize$1.DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  contract: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: true
  },
  employmentDeclaration: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: true
  },
  certification: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "employees"
});
const Package = sequelize.define("Package", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isActive: {
    type: sequelize$1.DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "packages"
});
const Sale = sequelize.define("Sale", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "employees",
      key: "id"
    }
  },
  packageId: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "packages",
      key: "id"
    }
  },
  clientName: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: sequelize$1.DataTypes.DATE,
    defaultValue: sequelize$1.DataTypes.NOW
  },
  description: {
    type: sequelize$1.DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "sales"
});
const Receipt = sequelize.define("Receipt", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "employees",
      key: "id"
    }
  },
  clientName: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: sequelize$1.DataTypes.DATE,
    defaultValue: sequelize$1.DataTypes.NOW
  },
  description: {
    type: sequelize$1.DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "receipts"
});
const Expense = sequelize.define("Expense", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: sequelize$1.DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: sequelize$1.DataTypes.DATE,
    defaultValue: sequelize$1.DataTypes.NOW
  },
  description: {
    type: sequelize$1.DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  }
}, {
  tableName: "expenses"
});
const Salary = sequelize.define("Salary", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "employees",
      key: "id"
    }
  },
  baseSalary: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commissionPercentage: {
    type: sequelize$1.DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  totalSalary: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  periodStart: {
    type: sequelize$1.DataTypes.DATE,
    allowNull: false
  },
  periodEnd: {
    type: sequelize$1.DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: "salaries"
});
const AdminCharge = sequelize.define("AdminCharge", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rent: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  charges: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  operatingCosts: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  electricity: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  salaries: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalCharges: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  month: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "admin_charges"
});
const Goal = sequelize.define("Goal", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "employees",
      key: "id"
    }
  },
  monthlyObjective: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dailyObjective: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  month: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false
  },
  remainingAmount: {
    type: sequelize$1.DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  isCompleted: {
    type: sequelize$1.DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "goals"
});
const Alert = sequelize.define("Alert", {
  id: {
    type: sequelize$1.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: sequelize$1.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "employees",
      key: "id"
    }
  },
  message: {
    type: sequelize$1.DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: sequelize$1.DataTypes.ENUM("daily", "monthly", "warning"),
    defaultValue: "daily"
  },
  isRead: {
    type: sequelize$1.DataTypes.BOOLEAN,
    defaultValue: false
  },
  date: {
    type: sequelize$1.DataTypes.DATE,
    defaultValue: sequelize$1.DataTypes.NOW
  }
}, {
  tableName: "alerts"
});
User$1.hasOne(Employee, { foreignKey: "userId", as: "employee" });
User$1.hasMany(Expense, { foreignKey: "createdBy", as: "expenses" });
Employee.belongsTo(User$1, { foreignKey: "userId", as: "user" });
Employee.hasMany(Sale, { foreignKey: "employeeId", as: "sales" });
Employee.hasMany(Receipt, { foreignKey: "employeeId", as: "receipts" });
Employee.hasMany(Salary, { foreignKey: "employeeId", as: "salaries" });
Employee.hasMany(Goal, { foreignKey: "employeeId", as: "goals" });
Employee.hasMany(Alert, { foreignKey: "employeeId", as: "alerts" });
Package.hasMany(Sale, { foreignKey: "packageId", as: "sales" });
Sale.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });
Sale.belongsTo(Package, { foreignKey: "packageId", as: "package" });
Receipt.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });
Expense.belongsTo(User$1, { foreignKey: "createdBy", as: "creator" });
Salary.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });
Goal.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });
Alert.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });
const { accessToken } = config.auth;
function generateAccessToken(payload) {
  return jwt.sign(payload, accessToken.secret, {
    algorithm: accessToken.algorithm,
    expiresIn: accessToken.expiresIn,
    audience: accessToken.audience,
    issuer: accessToken.issuer
  });
}
function verifyJwtToken(token) {
  try {
    return jwt.verify(token, accessToken.secret, {
      algorithms: [accessToken.algorithm],
      audience: accessToken.audience,
      issuer: accessToken.issuer
    });
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
}
const { scrypt } = config.auth.crypto;
async function hashPassword(password) {
  const salt = crypto.randomBytes(scrypt.saltLength).toString("hex");
  const hash = crypto.scryptSync(password, salt, scrypt.hashLength, {
    N: scrypt.cost,
    r: scrypt.blockSize,
    p: scrypt.parallelization,
    maxmem: scrypt.maxmem
  }).toString("hex");
  return `${salt}:${hash}`;
}
async function verifyPassword(password, hashedPassword) {
  const [salt, hash] = hashedPassword.split(":");
  const hashVerify = crypto.scryptSync(password, salt, scrypt.hashLength, {
    N: scrypt.cost,
    r: scrypt.blockSize,
    p: scrypt.parallelization,
    maxmem: scrypt.maxmem
  }).toString("hex");
  return hash === hashVerify;
}
const router$8 = express.Router();
router$8.post("/register", [
  expressValidator.body("username").isLength({ min: 3 }).trim().escape(),
  expressValidator.body("email").isEmail().normalizeEmail(),
  expressValidator.body("password").isLength({ min: 14 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  expressValidator.body("role").optional().isIn(["superAdmin", "admin", "user"])
], validateRequest, async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;
    const existingUser = await User$1.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const passwordHash = await hashPassword(password);
    const user = await User$1.create({
      username,
      email,
      passwordHash,
      role
    });
    const token = generateAccessToken({ id: user.id, username: user.username, email: user.email, role: user.role });
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$8.post("/login", [
  expressValidator.body("email").isEmail().normalizeEmail(),
  expressValidator.body("password").notEmpty()
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User$1.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = generateAccessToken({ id: user.id, username: user.username, email: user.email, role: user.role });
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1e3
      // 1 hour
    });
    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$8.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.json({ message: "Logout successful" });
});
router$8.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User$1.findByPk(req.user.id, {
      include: [{ model: Employee, as: "employee" }]
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        employee: user.employee
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const router$7 = express.Router();
router$7.get("/", isAuthenticated, requireRole(["admin", "superAdmin"]), async (req, res) => {
  try {
    const users = await User$1.findAll({
      include: [{ model: Employee, as: "employee" }],
      attributes: { exclude: ["passwordHash"] }
    });
    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$7.post("/", isAuthenticated, requireRole(["admin", "superAdmin"]), [
  expressValidator.body("username").isLength({ min: 3 }).trim().escape(),
  expressValidator.body("email").isEmail().normalizeEmail(),
  expressValidator.body("password").isLength({ min: 14 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  expressValidator.body("name").notEmpty().trim().escape(),
  expressValidator.body("position").notEmpty().trim().escape(),
  expressValidator.body("hireDate").isISO8601(),
  expressValidator.body("deductionPercentage").optional().isFloat({ min: 0, max: 100 })
], validateRequest, async (req, res) => {
  try {
    const { username, email, password, name, position, hireDate, deductionPercentage = 0 } = req.body;
    const existingUser = await User$1.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const passwordHash = await hashPassword(password);
    let avatarPath = null;
    let contractPath = null;
    let employmentDeclarationPath = null;
    let certificationPath = null;
    if (req.files) {
      const uploadDir = path.join(process.cwd(), "uploads");
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
    const user = await User$1.create({
      username,
      email,
      passwordHash,
      role: "user",
      avatar: avatarPath
    });
    const employee = await Employee.create({
      userId: user.id,
      name,
      position,
      hireDate,
      deductionPercentage,
      contract: contractPath,
      employmentDeclaration: employmentDeclarationPath,
      certification: certificationPath
    });
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        employee
      }
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$7.put("/:id", isAuthenticated, requireRole(["admin", "superAdmin"]), [
  expressValidator.body("username").optional().isLength({ min: 3 }).trim().escape(),
  expressValidator.body("email").optional().isEmail().normalizeEmail(),
  expressValidator.body("role").optional().isIn(["superAdmin", "admin", "user"]),
  expressValidator.body("isActive").optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User$1.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update(updates);
    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$7.put("/:id/deduction-percentage", isAuthenticated, requireRole(["admin", "superAdmin"]), [
  expressValidator.body("deductionPercentage").isFloat({ min: 0, max: 100 })
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { deductionPercentage } = req.body;
    const employee = await Employee.findOne({ where: { userId: id } });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    await employee.update({ deductionPercentage });
    res.json({
      message: "Deduction percentage updated successfully",
      employee: {
        id: employee.id,
        userId: employee.userId,
        deductionPercentage: employee.deductionPercentage
      }
    });
  } catch (error) {
    console.error("Update deduction percentage error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$7.delete("/:id", isAuthenticated, requireRole(["superAdmin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User$1.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const router$6 = express.Router();
router$6.get("/", isAuthenticated, async (req, res) => {
  try {
    const packages = await Package.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]]
    });
    res.json({ packages });
  } catch (error) {
    console.error("Get packages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$6.post("/", isAuthenticated, requireRole(["admin", "superAdmin"]), [
  expressValidator.body("name").notEmpty().trim().escape(),
  expressValidator.body("price").isFloat({ min: 0 })
], validateRequest, async (req, res) => {
  try {
    const { name, price } = req.body;
    const pkg = await Package.create({
      name,
      price
    });
    res.status(201).json({
      message: "Package created successfully",
      package: pkg
    });
  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$6.put("/:id", isAuthenticated, requireRole(["admin", "superAdmin"]), [
  expressValidator.body("name").optional().notEmpty().trim().escape(),
  expressValidator.body("price").optional().isFloat({ min: 0 }),
  expressValidator.body("isActive").optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ error: "Package not found" });
    }
    await pkg.update(updates);
    res.json({
      message: "Package updated successfully",
      package: pkg
    });
  } catch (error) {
    console.error("Update package error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$6.delete("/:id", isAuthenticated, requireRole(["admin", "superAdmin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ error: "Package not found" });
    }
    await pkg.update({ isActive: false });
    res.json({ message: "Package deactivated successfully" });
  } catch (error) {
    console.error("Delete package error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const router$5 = express.Router();
router$5.get("/employee/:employeeId", isAuthenticated, async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const sales = await Sale.findAll({
      where: { employeeId },
      include: [
        { model: Package, as: "package" },
        { model: Employee, as: "employee", include: [{ model: User, as: "user" }] }
      ],
      order: [["date", "DESC"]]
    });
    res.json({ sales });
  } catch (error) {
    console.error("Get sales error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$5.post("/employee/:employeeId", isAuthenticated, [
  expressValidator.body("packageId").isInt({ min: 1 }),
  expressValidator.body("clientName").notEmpty().trim().escape(),
  expressValidator.body("description").optional().trim().escape()
], validateRequest, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { packageId, clientName, description } = req.body;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee2 = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee2 || employee2.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const pkg = await Package.findOne({ where: { id: packageId, isActive: true } });
    if (!pkg) {
      return res.status(404).json({ error: "Package not found or inactive" });
    }
    const sale = await Sale.create({
      employeeId,
      packageId,
      clientName,
      amount: pkg.price,
      description
    });
    const saleWithDetails = await Sale.findByPk(sale.id, {
      include: [
        { model: Package, as: "package" },
        { model: Employee, as: "employee", include: [{ model: User, as: "user" }] }
      ]
    });
    res.status(201).json({
      message: "Sale created successfully",
      sale: saleWithDetails
    });
  } catch (error) {
    console.error("Create sale error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$5.put("/employee/:employeeId/sale/:saleId", isAuthenticated, [
  expressValidator.body("clientName").optional().notEmpty().trim().escape(),
  expressValidator.body("amount").optional().isFloat({ min: 0 }),
  expressValidator.body("description").optional().trim().escape()
], validateRequest, async (req, res) => {
  try {
    const { employeeId, saleId } = req.params;
    const updates = req.body;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const sale = await Sale.findOne({ where: { id: saleId, employeeId } });
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    await sale.update(updates);
    const updatedSale = await Sale.findByPk(saleId, {
      include: [
        { model: Package, as: "package" },
        { model: Employee, as: "employee", include: [{ model: User, as: "user" }] }
      ]
    });
    res.json({
      message: "Sale updated successfully",
      sale: updatedSale
    });
  } catch (error) {
    console.error("Update sale error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$5.delete("/employee/:employeeId/sale/:saleId", isAuthenticated, async (req, res) => {
  try {
    const { employeeId, saleId } = req.params;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const sale = await Sale.findOne({ where: { id: saleId, employeeId } });
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    await sale.destroy();
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Delete sale error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const router$4 = express.Router();
router$4.get("/employee/:employeeId", isAuthenticated, async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const receipts = await Receipt.findAll({
      where: { employeeId },
      include: [{ model: Employee, as: "employee", include: [{ model: User, as: "user" }] }],
      order: [["date", "DESC"]]
    });
    res.json({ receipts });
  } catch (error) {
    console.error("Get receipts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$4.post("/employee/:employeeId", isAuthenticated, [
  expressValidator.body("clientName").notEmpty().trim().escape(),
  expressValidator.body("amount").isFloat({ min: 0 }),
  expressValidator.body("description").optional().trim().escape()
], validateRequest, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { clientName, amount, description } = req.body;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee2 = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee2 || employee2.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const receipt = await Receipt.create({
      employeeId,
      clientName,
      amount,
      description
    });
    const receiptWithDetails = await Receipt.findByPk(receipt.id, {
      include: [{ model: Employee, as: "employee", include: [{ model: User, as: "user" }] }]
    });
    res.status(201).json({
      message: "Receipt added successfully",
      receipt: receiptWithDetails
    });
  } catch (error) {
    console.error("Add receipt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$4.put("/employee/:employeeId/receipt/:receiptId", isAuthenticated, [
  expressValidator.body("clientName").optional().notEmpty().trim().escape(),
  expressValidator.body("amount").optional().isFloat({ min: 0 }),
  expressValidator.body("description").optional().trim().escape()
], validateRequest, async (req, res) => {
  try {
    const { employeeId, receiptId } = req.params;
    const updates = req.body;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const receipt = await Receipt.findOne({ where: { id: receiptId, employeeId } });
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }
    await receipt.update(updates);
    const updatedReceipt = await Receipt.findByPk(receiptId, {
      include: [{ model: Employee, as: "employee", include: [{ model: User, as: "user" }] }]
    });
    res.json({
      message: "Receipt updated successfully",
      receipt: updatedReceipt
    });
  } catch (error) {
    console.error("Update receipt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$4.delete("/employee/:employeeId/receipt/:receiptId", isAuthenticated, async (req, res) => {
  try {
    const { employeeId, receiptId } = req.params;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const receipt = await Receipt.findOne({ where: { id: receiptId, employeeId } });
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }
    await receipt.destroy();
    res.json({ message: "Receipt deleted successfully" });
  } catch (error) {
    console.error("Delete receipt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const router$3 = express.Router();
router$3.get("/", isAuthenticated, requireRole(["admin", "superAdmin"]), async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      include: [{ model: User$1, as: "creator" }],
      order: [["date", "DESC"]]
    });
    res.json({ expenses });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$3.post("/", isAuthenticated, [
  expressValidator.body("category").notEmpty().trim().escape(),
  expressValidator.body("amount").isFloat({ min: 0 }),
  expressValidator.body("description").optional().trim().escape()
], validateRequest, async (req, res) => {
  try {
    const { category, amount, description } = req.body;
    const expense = await Expense.create({
      category,
      amount,
      description,
      createdBy: req.user.id
    });
    const expenseWithCreator = await Expense.findByPk(expense.id, {
      include: [{ model: User$1, as: "creator" }]
    });
    res.status(201).json({
      message: "Expense created successfully",
      expense: expenseWithCreator
    });
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$3.put("/:id", isAuthenticated, [
  expressValidator.body("category").optional().notEmpty().trim().escape(),
  expressValidator.body("amount").optional().isFloat({ min: 0 }),
  expressValidator.body("description").optional().trim().escape()
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (req.user.role !== "superAdmin" && req.user.role !== "admin" && expense.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    await expense.update(updates);
    const updatedExpense = await Expense.findByPk(id, {
      include: [{ model: User$1, as: "creator" }]
    });
    res.json({
      message: "Expense updated successfully",
      expense: updatedExpense
    });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$3.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (req.user.role !== "superAdmin" && req.user.role !== "admin" && expense.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    await expense.destroy();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const router$2 = express.Router();
router$2.get("/employee/:employeeId", isAuthenticated, async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || employee.id != employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const salaries = await Salary.findAll({
      where: { employeeId },
      include: [{ model: Employee, as: "employee" }],
      order: [["periodEnd", "DESC"]]
    });
    res.json({ salaries });
  } catch (error) {
    console.error("Get salaries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$2.post("/generate", isAuthenticated, requireRole(["admin", "superAdmin"]), [
  expressValidator.body("periodStart").isISO8601(),
  expressValidator.body("periodEnd").isISO8601()
], validateRequest, async (req, res) => {
  try {
    const { periodStart, periodEnd } = req.body;
    const employees = await Employee.findAll();
    const generatedSalaries = [];
    for (const employee of employees) {
      const receipts = await Receipt.findAll({
        where: {
          employeeId: employee.id,
          date: {
            [sequelize$1.Op.between]: [periodStart, periodEnd]
          }
        }
      });
      const totalReceipts = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0);
      const sales = await Sale.findAll({
        where: {
          employeeId: employee.id,
          date: {
            [sequelize$1.Op.between]: [periodStart, periodEnd]
          }
        }
      });
      const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
      const adminCharges = await AdminCharge.findOne({
        where: {
          month: new Date(periodStart).getMonth() + 1,
          year: new Date(periodStart).getFullYear()
        }
      });
      const deductionAmount = (totalReceipts + totalSales) * (employee.deductionPercentage / 100);
      const totalSalary = totalReceipts + totalSales - deductionAmount;
      const salary = await Salary.create({
        employeeId: employee.id,
        baseSalary: totalReceipts + totalSales,
        commissionPercentage: employee.deductionPercentage,
        totalSalary: Math.max(0, totalSalary),
        // Ensure non-negative
        periodStart,
        periodEnd
      });
      generatedSalaries.push(salary);
    }
    res.status(201).json({
      message: "Salaries generated successfully",
      salaries: generatedSalaries
    });
  } catch (error) {
    console.error("Generate salaries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const router$1 = express.Router();
router$1.get("/", isAuthenticated, requireRole(["admin", "superAdmin"]), async (req, res) => {
  try {
    const adminCharges = await AdminCharge.findAll({
      order: [["year", "DESC"], ["month", "DESC"]]
    });
    res.json({ adminCharges });
  } catch (error) {
    console.error("Get admin charges error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$1.post("/", isAuthenticated, requireRole(["admin", "superAdmin"]), [
  expressValidator.body("month").isInt({ min: 1, max: 12 }),
  expressValidator.body("year").isInt({ min: 2020 }),
  expressValidator.body("amount").isFloat({ min: 0 })
], validateRequest, async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    const existingCharge = await AdminCharge.findOne({ where: { month, year } });
    if (existingCharge) {
      return res.status(400).json({ error: "Admin charge already exists for this month/year" });
    }
    const adminCharge = await AdminCharge.create({
      month,
      year,
      amount
    });
    res.status(201).json({
      message: "Admin charge created successfully",
      adminCharge
    });
  } catch (error) {
    console.error("Create admin charge error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$1.put("/:id", isAuthenticated, requireRole(["admin", "superAdmin"]), [
  expressValidator.body("amount").isFloat({ min: 0 })
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const adminCharge = await AdminCharge.findByPk(id);
    if (!adminCharge) {
      return res.status(404).json({ error: "Admin charge not found" });
    }
    await adminCharge.update({ amount });
    res.json({
      message: "Admin charge updated successfully",
      adminCharge
    });
  } catch (error) {
    console.error("Update admin charge error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router$1.delete("/:id", isAuthenticated, requireRole(["admin", "superAdmin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const adminCharge = await AdminCharge.findByPk(id);
    if (!adminCharge) {
      return res.status(404).json({ error: "Admin charge not found" });
    }
    await adminCharge.destroy();
    res.json({ message: "Admin charge deleted successfully" });
  } catch (error) {
    console.error("Delete admin charge error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const router = express.Router();
router.get("/dashboard", isAuthenticated, requireRole(["admin", "superAdmin"]), async (req, res) => {
  try {
    const currentDate = /* @__PURE__ */ new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    const totalSales = await Sale.sum("amount", {
      where: {
        date: {
          [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
        }
      }
    }) || 0;
    const totalReceipts = await Receipt.sum("amount", {
      where: {
        date: {
          [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
        }
      }
    }) || 0;
    const totalExpenses = await Expense.sum("amount", {
      where: {
        date: {
          [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
        }
      }
    }) || 0;
    const totalSalaries = await Salary.sum("totalSalary", {
      where: {
        periodStart: {
          [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
        }
      }
    }) || 0;
    const adminCharge = await AdminCharge.findOne({
      where: { month: currentMonth, year: currentYear }
    });
    const totalAdminCharges = adminCharge ? parseFloat(adminCharge.amount) : 0;
    const netProfit = totalSales + totalReceipts - totalExpenses - totalSalaries - totalAdminCharges;
    const employeePerformance = await Employee.findAll({
      include: [
        {
          model: Sale,
          as: "sales",
          where: {
            date: {
              [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
            }
          },
          required: false
        },
        {
          model: Receipt,
          as: "receipts",
          where: {
            date: {
              [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
            }
          },
          required: false
        }
      ],
      attributes: ["id", "name"]
    });
    const performanceData = employeePerformance.map((emp) => ({
      id: emp.id,
      name: emp.name,
      totalSales: emp.sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0),
      totalReceipts: emp.receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0),
      total: emp.sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0) + emp.receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0)
    })).sort((a, b) => b.total - a.total).slice(0, 5);
    const popularPackages = await Package.findAll({
      include: [
        {
          model: Sale,
          as: "sales",
          where: {
            date: {
              [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
            }
          },
          required: false
        }
      ],
      attributes: ["id", "name", "price"]
    });
    const packageData = popularPackages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      salesCount: pkg.sales.length,
      totalRevenue: pkg.sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0)
    })).sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
    res.json({
      currentMonth: {
        totalSales,
        totalReceipts,
        totalExpenses,
        totalSalaries,
        totalAdminCharges,
        netProfit
      },
      employeePerformance: performanceData,
      popularPackages: packageData
    });
  } catch (error) {
    console.error("Get dashboard analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/revenue", isAuthenticated, requireRole(["admin", "superAdmin"]), async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = /* @__PURE__ */ new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      const sales = await Sale.sum("amount", {
        where: {
          date: {
            [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
          }
        }
      }) || 0;
      const receipts = await Receipt.sum("amount", {
        where: {
          date: {
            [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
          }
        }
      }) || 0;
      const expenses = await Expense.sum("amount", {
        where: {
          date: {
            [sequelize$1.Op.between]: [startOfMonth, endOfMonth]
          }
        }
      }) || 0;
      data.push({
        month: `${year}-${month.toString().padStart(2, "0")}`,
        sales,
        receipts,
        expenses,
        totalRevenue: sales + receipts
      });
    }
    res.json({ revenue: data });
  } catch (error) {
    console.error("Get revenue analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
if (typeof PhusionPassenger !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}
const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);
app.use(cors({
  origin: config.server.cors,
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB
  abortOnLimit: true
}));
app.use(cookieParser());
app.use(csurf({ cookie: true }));
app.use("/uploads", express.static("uploads"));
const frontendPath = path.join(process.cwd(), "..", "frontend", "dist");
app.use(express.static(frontendPath));
sequelize.authenticate().then(() => console.log("Database connected successfully.")).catch((err) => console.error("Database connection failed:", err));
const { url } = config.server;
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "EasyGestion API",
      version: "1.0.0",
      description: "API pour la gestion d'un salon de coiffure"
    },
    servers: [
      {
        url,
        description: `API Serveur - ${url}`
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ["./src/routes/*.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api/v1/auth", router$8);
app.use("/api/v1/users", router$7);
app.use("/api/v1/packages", router$6);
app.use("/api/v1/sales", router$5);
app.use("/api/v1/receipts", router$4);
app.use("/api/v1/expenses", router$3);
app.use("/api/v1/salaries", router$2);
app.use("/api/v1/admin-charges", router$1);
app.use("/api/v1/analytics", router);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
if (typeof PhusionPassenger !== "undefined") {
  app.listen("passenger");
} else {
  const { port, host } = config.server;
  app.listen(port, host, () => {
    console.log(`🚀 Server listening on http://${host}:${port}`);
  });
}
function isAuthenticated(req, res, next) {
  var _a, _b, _c;
  const accessToken2 = ((_b = (_a = req.headers) == null ? void 0 : _a["authorization"]) == null ? void 0 : _b.split("Bearer ")[1]) || ((_c = req.cookies) == null ? void 0 : _c.accessToken);
  if (!accessToken2) {
    return res.status(401).json({ status: 401, message: "No access token provided" });
  }
  const decodedToken = verifyJwtToken(accessToken2);
  if (!decodedToken) {
    return res.status(401).json({ status: 401, message: "Invalid access token" });
  }
  req.user = decodedToken;
  req.accessToken = accessToken2;
  next();
}
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 403, message: "Insufficient permissions" });
    }
    next();
  };
}
function validateRequest(validations) {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }
    const errors = expressValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
}
exports.isAuthenticated = isAuthenticated;
exports.requireRole = requireRole;
exports.validateRequest = validateRequest;
