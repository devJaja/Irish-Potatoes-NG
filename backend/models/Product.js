const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['fresh', 'processed', 'seeds'] },
  weight: { type: String, required: true }, // e.g., "50kg", "25kg"
  stock: { type: Number, required: true, default: 0 },
  images: [String],
  origin: { type: String, default: 'Jos Plateau' },
  isActive: { type: Boolean, default: true },
  bulkPricing: [{
    minQuantity: Number,
    discount: Number // percentage
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
