const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const { sendOrderEmail } = require('../utils/email');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
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

    // Apply bulk discount
    const bulkDiscount = product.bulkPricing.find(
      (bp) => item.quantity >= bp.minQuantity
    );
    if (bulkDiscount) {
      const discountAmount = itemPrice * (bulkDiscount.discount / 100);
      discount += discountAmount;
      itemPrice -= discountAmount;
    }

    totalAmount += itemPrice;
    item.price = product.price;
  }

  const order = new Order({
    user: req.userId,
    items,
    totalAmount: totalAmount - discount,
    discount,
    shippingAddress,
  });

  await order.save();
  
  // Repopulate user to get email for the confirmation email
  const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

  // Update stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  await sendOrderEmail(populatedOrder);
  res.status(201).json(populatedOrder);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images');

  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

module.exports = router;

