import User from './User.js';
import Employee from './Employee.js';
import Package from './Package.js';
import Sale from './Sale.js';
import Receipt from './Receipt.js';
import Expense from './Expense.js';
import Salary from './Salary.js';
import AdminCharge from './AdminCharge.js';
import Goal from './Goal.js';
import Alert from './Alert.js';

// User associations
User.hasOne(Employee, { foreignKey: 'userId', as: 'employee' });
User.hasMany(Expense, { foreignKey: 'createdBy', as: 'expenses' });

// Employee associations
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Employee.hasMany(Sale, { foreignKey: 'employeeId', as: 'sales' });
Employee.hasMany(Receipt, { foreignKey: 'employeeId', as: 'receipts' });
Employee.hasMany(Salary, { foreignKey: 'employeeId', as: 'salaries' });
Employee.hasMany(Goal, { foreignKey: 'employeeId', as: 'goals' });
Employee.hasMany(Alert, { foreignKey: 'employeeId', as: 'alerts' });

// Package associations
Package.hasMany(Sale, { foreignKey: 'packageId', as: 'sales' });

// Sale associations
Sale.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Sale.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });

// Receipt associations
Receipt.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Expense associations
Expense.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Salary associations
Salary.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Goal associations
Goal.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Alert associations
Alert.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

export {
  User,
  Employee,
  Package,
  Sale,
  Receipt,
  Expense,
  Salary,
  AdminCharge,
  Goal,
  Alert,
};
