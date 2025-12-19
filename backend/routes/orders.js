const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { sendOrderEmail } = require('../utils/email');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    let totalAmount = 0;
    let discount = 0;

    // Calculate total and apply bulk discounts
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product?.name}` });
      }

      let itemPrice = product.price * item.quantity;

      // Apply bulk discount only if bulkPricing exists and a valid discount is found
      if (product.bulkPricing && product.bulkPricing.length > 0) {
        const bulkDiscount = product.bulkPricing
          .sort((a, b) => b.minQuantity - a.minQuantity) // Ensure largest applicable discount is found first
          .find((bp) => item.quantity >= bp.minQuantity);
        
        if (bulkDiscount) {
          const discountAmount = itemPrice * (bulkDiscount.discount / 100);
          discount += discountAmount;
          itemPrice -= discountAmount;
        }
      }

      totalAmount += itemPrice;
      item.price = product.price; // Store the original unit price
    }

    const order = new Order({
      user: req.userId,
      items,
      totalAmount: totalAmount, // Corrected: totalAmount is already calculated with discounts
      discount,
      shippingAddress,
    });

    await order.save();
    
    // Repopulate user and product details to get data for the confirmation email
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name');

    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    await sendOrderEmail(populatedOrder);
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'An internal error occurred while creating the order.' });
  }
});

// Get all orders for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images');

  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// ADMIN: Get all orders
router.get('/admin/all', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching all orders.' });
  }
});

// ADMIN: Update order status
router.put('/admin/orders/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.orderStatus = status; // Corrected from order.status
    await order.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating order status.' });
  }
});

module.exports = router;

