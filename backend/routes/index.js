const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const appointmentController = require('../controllers/appointmentController');
const invoiceController = require('../controllers/invoiceController');
const { getServices, createService, updateService, getDoctors, createDoctor } = require('../controllers/generalController');
const dashboardController = require('../controllers/dashboardController');
const logController = require('../controllers/logController');
const couponController = require('../controllers/couponController');
const notificationController = require('../controllers/notificationController');
const validate = require('../middleware/validate');
const { 
  authSchema, productSchema, serviceSchema, 
  invoiceSchema, appointmentSchema, updateAppointmentSchema 
} = require('../utils/schemas');

const userController = require('../controllers/userController');
const { sequelize } = require('../models');

// Health Check
router.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// Auth Routes
router.post('/auth/login', validate(authSchema), authController.login);
router.post('/auth/register', validate(authSchema), authController.register);

// User (self) — must come BEFORE /users/:id
router.get('/users/me', authenticate, authController.getMe);



router.get('/users', authenticate, authorize(['admin']), userController.getUsers);
router.get('/customers', authenticate, authorize(['admin', 'receptionist']), userController.getCustomers);
router.post('/users', authenticate, authorize(['admin']), validate(authSchema), userController.createUser);

// Admin: User Management — individual (dynamic :id after static routes)
router.put('/users/:id', authenticate, authorize(['admin']), validate(authSchema), userController.updateUser);
router.delete('/users/:id', authenticate, authorize(['admin']), userController.deleteUser);

// Products — static image delete must come BEFORE dynamic /products/:id
router.delete('/products/images/:imageId', authenticate, authorize(['admin']), productController.deleteProductImage);

// Products CRUD
router.get('/products', productController.getProducts);
router.post(
  '/products',
  authenticate,
  authorize(['admin']),
  upload.array('images', 10),
  validate(productSchema),
  productController.createProduct
);
router.put(
  '/products/:id',
  authenticate,
  authorize(['admin']),
  upload.array('images', 10),
  validate(productSchema),
  productController.updateProduct
);
router.delete('/products/:id', authenticate, authorize(['admin']), productController.deleteProduct);
router.delete('/products/:id/images/:imageId', authenticate, authorize(['admin']), productController.deleteProductImage);
router.get('/products/:id/history', authenticate, authorize(['admin', 'receptionist']), productController.getProductHistory);


// Services
router.get('/services', getServices);
router.post('/services', authenticate, authorize(['admin']), validate(serviceSchema), createService);
router.put('/services/:id', authenticate, authorize(['admin']), validate(serviceSchema), updateService);

// Doctors
router.get('/doctors', getDoctors);
router.post('/doctors', authenticate, authorize(['admin']), createDoctor);

// Appointments
router.get('/appointments', authenticate, appointmentController.getAppointments);
router.post('/appointments', authenticate, validate(appointmentSchema), appointmentController.createAppointment);
router.put('/appointments/:id', authenticate, authorize(['admin', 'receptionist', 'customer']), appointmentController.updateAppointment);

// Invoices
router.get('/invoices', authenticate, authorize(['admin', 'receptionist', 'customer']), invoiceController.getInvoices);
router.get('/invoices/:id', authenticate, authorize(['admin', 'receptionist', 'customer']), invoiceController.getInvoiceById);
router.post('/invoices', authenticate, authorize(['admin', 'receptionist']), validate(invoiceSchema), invoiceController.createInvoice);
router.put('/invoices/:id', authenticate, authorize(['admin', 'receptionist']), validate(invoiceSchema), invoiceController.updateInvoice);
router.delete('/invoices/:id', authenticate, authorize(['admin']), invoiceController.deleteInvoice);

// Dashboard Stats
router.get('/dashboard/stats', authenticate, authorize(['admin', 'receptionist']), dashboardController.getStats);

// Coupons
router.get('/coupons', authenticate, authorize(['admin', 'receptionist']), couponController.getCoupons);
router.post('/coupons', authenticate, authorize(['admin']), couponController.createCoupon);
router.put('/coupons/:id', authenticate, authorize(['admin']), couponController.updateCoupon);
router.delete('/coupons/:id', authenticate, authorize(['admin']), couponController.deleteCoupon);
router.post('/coupons/validate', authenticate, couponController.validateCoupon);

// Logs
router.get('/logs', authenticate, authorize(['admin']), logController.getLogs);

// Notifications
router.get('/notifications', authenticate, notificationController.getNotifications);
router.put('/notifications/:id/read', authenticate, notificationController.markAsRead);
router.delete('/notifications', authenticate, notificationController.clearNotifications);

module.exports = router;
