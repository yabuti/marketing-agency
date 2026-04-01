import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ContactMessage = sequelize.define('ContactMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  business_type: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: false },
  tin_number: { type: DataTypes.STRING, allowNull: false },
  elmis_registration: { type: DataTypes.STRING, allowNull: false },
  business_license_number: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('new', 'read', 'replied'), defaultValue: 'new' }
}, {
  tableName: 'contact_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ContactMessage;
