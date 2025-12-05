const express = require('express');
const Joi = require('joi');
const Product = require('../models/Product');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Joi schema for product validation
const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid('fresh', 'processed', 'seeds').required(),
  weight: Joi.string().required(),
  stock: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string().uri()),
  origin: Joi.string(),
  isActive: Joi.boolean(),
  bulkPricing: Joi.array().items(
    Joi.object({
      minQuantity: Joi.number().integer().positive().required(),
      discount: Joi.number().min(0).max(100).required(),
    })
  ),
});

router.get('/', async (req, res) => {
  const { page = 1, limit = 12, category, search } = req.query;
  const query = { isActive: true };

  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };

  const products = await Product.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(query);

  res.json({
    products,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  });
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// @route   POST api/products
// @desc    Create a product
// @access  Private (Admin only)
router.post('/', [authenticateToken, authorizeAdmin], async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newProduct = new Product(req.body);
  const product = await newProduct.save();
  res.status(201).json(product);
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private (Admin only)
router.put('/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json({ message: 'Product removed' });
});

module.exports = router;

