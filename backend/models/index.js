const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Doctor = require('./Doctor');
const Service = require('./Service');
const Appointment = require('./Appointment');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const ActivityLog = require('./ActivityLog');
const Coupon = require('./Coupon');
const Notification = require('./Notification');

// Relationships

// Product - Images
Product.hasMany(ProductImage, { foreignKey: 'productId', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

// User - Appointments (Customer role)
User.hasMany(Appointment, { foreignKey: 'userId', as: 'customer', onDelete: 'CASCADE' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// Doctor - Appointments
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', onDelete: 'SET NULL' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

// User - Invoices (Staff who created it)
User.hasMany(Invoice, { foreignKey: 'createdBy', as: 'creator', onDelete: 'SET NULL' });
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User - Invoices (Customer who owns it)
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices', onDelete: 'SET NULL' });
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'customerUser' });

// Invoice - Items
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

// Product/Service - Invoice Items
Product.hasMany(InvoiceItem, { foreignKey: 'productId', onDelete: 'SET NULL' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId' });

Service.hasMany(InvoiceItem, { foreignKey: 'serviceId', onDelete: 'SET NULL' });
InvoiceItem.belongsTo(Service, { foreignKey: 'serviceId' });

// Doctor - Invoices
Doctor.hasMany(Invoice, { foreignKey: 'doctorId', onDelete: 'SET NULL' });
Invoice.belongsTo(Doctor, { foreignKey: 'doctorId' });

// User - Activity Logs
User.hasMany(ActivityLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

// User - Notifications
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Product,
  ProductImage,
  Doctor,
  Service,
  Appointment,
  Invoice,
  InvoiceItem,
  ActivityLog,
  Coupon,
  Notification
};
