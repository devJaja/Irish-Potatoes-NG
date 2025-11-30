const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config({ path: __dirname + '/.env' });

const sampleProducts = [
  {
    name: "Premium Irish Potatoes",
    description: "Fresh, high-quality Irish potatoes from Jos Plateau. Perfect for cooking and frying.",
    price: 15000,
    category: "fresh",
    weight: "50kg",
    stock: 100,
    images: [],
    bulkPricing: [
      { minQuantity: 5, discount: 5 },
      { minQuantity: 10, discount: 10 }
    ]
  },
  {
    name: "Small Irish Potatoes",
    description: "Perfect size for home cooking. Fresh from Jos farms.",
    price: 8000,
    category: "fresh",
    weight: "25kg",
    stock: 150,
    images: [],
    bulkPricing: [
      { minQuantity: 10, discount: 8 }
    ]
  },
  {
    name: "Irish Potato Seeds",
    description: "High-quality potato seeds for farming. Certified variety.",
    price: 25000,
    category: "seeds",
    weight: "10kg",
    stock: 50,
    images: [],
    bulkPricing: [
      { minQuantity: 3, discount: 15 }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    
    console.log('Sample data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
