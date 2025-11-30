const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
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
      
      // Apply bulk discount
      const bulkDiscount = product.bulkPricing.find(bp => item.quantity >= bp.minQuantity);
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
      shippingAddress
    });

    await order.save();
    
    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    await sendOrderEmail(order);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
