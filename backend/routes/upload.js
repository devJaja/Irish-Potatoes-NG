const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint for product image uploads (Admin only)
router.post('/products', [authenticateToken, authorizeAdmin, upload.array('images', 5)], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadPromises = req.files.map(file => {
      // Create a base64 string from the buffer
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      // Upload image to Cloudinary
      return cloudinary.uploader.upload(base64String, {
        folder: 'plateau-potatoes-products', // Specific folder for product images
        transformation: [{ width: 800, height: 600, crop: 'limit' }], // Resize without cropping
      });
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.secure_url);

    res.status(200).json({
      message: 'Images uploaded successfully.',
      imageUrls: imageUrls,
    });

  } catch (error) {
    console.error('Cloudinary product image upload error:', error);
    res.status(500).json({ message: 'Error uploading images.' });
  }
});


// Endpoint for avatar upload
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      folder: 'plateau-potatoes-avatars', // Optional: specify a folder in Cloudinary
      transformation: [{ width: 150, height: 150, crop: 'fill', gravity: 'face' }], // Optional: resize and crop
    });

    // Update user's avatar URL in the database
    const user = await User.findById(req.userId);
    if (!user) {
      // This case should ideally not happen if authenticateToken works
      return res.status(404).json({ message: 'User not found.' });
    }

    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      message: 'Avatar uploaded successfully.',
      avatarUrl: result.secure_url,
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar.' });
  }
});

module.exports = router;
