const { Product, ProductImage, ActivityLog, User } = require('../models');
const { Op } = require('sequelize');
const logActivity = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');

exports.getProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [ProductImage],
    order: [['name', 'ASC']],
    limit,
    offset,
    distinct: true
  });

  res.json({
    products: rows,
    meta: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id, { include: [ProductImage] });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    quantity: req.body.quantity,
  });

  const imageRecords = [];

  // Uploaded files
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      imageRecords.push({ 
        productId: product.id, 
        imageUrl: `/uploads/${file.filename}`, 
        type: 'high' 
      });
    }
  }

  // URL-based images (comma-separated or JSON array)
  if (req.body.imageUrls) {
    const urls = Array.isArray(req.body.imageUrls)
      ? req.body.imageUrls
      : req.body.imageUrls.split(',').map(u => u.trim()).filter(Boolean);
    for (const url of urls) {
      imageRecords.push({ productId: product.id, imageUrl: url, type: 'high' });
    }
  }

  if (imageRecords.length > 0) {
    await ProductImage.bulkCreate(imageRecords);
  }

  logActivity(req.user.id, 'create', 'Product', product.id, `Created product ${product.name}`);

  const fullProduct = await Product.findByPk(product.id, { include: [ProductImage] });
  res.status(201).json(fullProduct);
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });

  await product.update({
    name: req.body.name || product.name,
    price: req.body.price || product.price,
    description: req.body.description !== undefined ? req.body.description : product.description,
    quantity: req.body.quantity !== undefined ? req.body.quantity : product.quantity,
  });

  // Add new uploaded files
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      await ProductImage.create({ 
        productId: product.id, 
        imageUrl: `/uploads/${file.filename}`, 
        type: 'high' 
      });
    }
  }

  // Add new URL-based images
  if (req.body.imageUrls) {
    const urls = Array.isArray(req.body.imageUrls)
      ? req.body.imageUrls
      : req.body.imageUrls.split(',').map(u => u.trim()).filter(Boolean);
    for (const url of urls) {
      await ProductImage.create({ productId: product.id, imageUrl: url, type: 'high' });
    }
  }

  logActivity(req.user.id, 'update', 'Product', product.id, `Updated product ${product.name}`);
  const fullProduct = await Product.findByPk(product.id, { include: [ProductImage] });
  res.json(fullProduct);
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id, { include: [ProductImage] });
  if (!product) return res.status(404).json({ error: 'Not found' });

  // Delete images from local storage and database
  const fs = require('fs');
  const path = require('path');
  for (const img of (product.ProductImages || [])) {
    if (img.imageUrl?.includes('/uploads/')) {
      const filename = img.imageUrl.split('/uploads/').pop();
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }
  }

  await product.destroy();
  logActivity(req.user.id, 'delete', 'Product', product.id, `Deleted product ${product.name} and its images`);
  res.json({ message: 'Deleted' });
});

exports.deleteProductImage = catchAsync(async (req, res, next) => {
  const image = await ProductImage.findByPk(req.params.imageId);
  if (!image) return res.status(404).json({ error: 'Image not found' });

  // Delete from local storage
  if (image.imageUrl?.includes('/uploads/')) {
    const fs = require('fs');
    const path = require('path');
    const filename = image.imageUrl.split('/uploads/').pop();
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }

  await image.destroy();
  res.json({ message: 'Image deleted' });
});

exports.getProductHistory = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { count, rows } = await ActivityLog.findAndCountAll({
    where: { entity: 'Product', entityId: req.params.id },
    include: [{ model: User, attributes: ['name', 'email'], required: false }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.json({ 
    product: { id: product.id, name: product.name, quantity: product.quantity }, 
    logs: rows,
    meta: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  });
});

