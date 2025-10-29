import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hireDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deductionPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
  contract: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  employmentDeclaration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  certification: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'employees',
});

export default Employee;
