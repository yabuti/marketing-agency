import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Client = sequelize.define('Client', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING, defaultValue: '🏢' },
  category: { type: DataTypes.STRING, allowNull: false },
  industry: { type: DataTypes.STRING, allowNull: false },
  business_type: { type: DataTypes.STRING },
  gradient: { type: DataTypes.STRING, defaultValue: 'linear-gradient(135deg, #f97316, #fb923c)' },
  short_desc: { type: DataTypes.TEXT, allowNull: false },
  full_description: { type: DataTypes.TEXT, allowNull: false },
  established: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  employees: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  tin_number: { type: DataTypes.STRING },
  business_license_number: { type: DataTypes.STRING },
  elmis_registration: { type: DataTypes.STRING },
  website: { type: DataTypes.STRING },
  license_type: { type: DataTypes.STRING, allowNull: false },
  license_number: { type: DataTypes.STRING, allowNull: false },
  license_issue: { type: DataTypes.STRING, allowNull: false },
  license_expiry: { type: DataTypes.STRING, allowNull: false },
  authority: { type: DataTypes.STRING, allowNull: false },
  extra_doc: { type: DataTypes.STRING },
  followers: { type: DataTypes.STRING, defaultValue: '0' },
  growth: { type: DataTypes.STRING, defaultValue: '0%' },
  engagement: { type: DataTypes.STRING, defaultValue: '0%' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Client;
