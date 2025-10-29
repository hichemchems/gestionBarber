import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Salary = sequelize.define('Salary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id',
    },
  },
  baseSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  commissionPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
  totalSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'salaries',
});

export default Salary;
