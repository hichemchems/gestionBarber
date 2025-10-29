import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const AdminCharge = sequelize.define('AdminCharge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  charges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  operatingCosts: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  electricity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  salaries: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  totalCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'admin_charges',
});

export default AdminCharge;
