const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

require('express-async-errors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload'); // Import upload routes

// error handler
const errorHandlerMiddleware = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: 'https://irish-potatoes-ng.vercel.app/',
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes); // Use upload routes

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
