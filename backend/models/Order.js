const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    index: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  paymentReference: String,
  trackingNumber: String,
  deliveryDate: Date
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.orderId = `NSPD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
