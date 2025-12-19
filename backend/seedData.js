const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User'); // Import the User model
require('dotenv').config({ path: __dirname + '/.env' });

const sampleProducts = [
  {
    name: "Premium Plateau Potatoes",
    description: "Fresh, high-quality Plateau potatoes from Jos Plateau. Perfect for cooking and frying.",
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
    name: "Small Plateau Potatoes",
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
    name: "Plateau Potato Seeds",
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
    
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({}); // Also clear users

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted successfully');

    // Create a default admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "adminpassword", // The password will be hashed by the pre-save hook in the User model
      phone: "08012345678",
      role: "admin"
    });
    await adminUser.save();
    console.log('Admin user created successfully');
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
