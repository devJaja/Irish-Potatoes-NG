const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User'); // Assuming we'll update the user avatar here

const router = express.Router();

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint for avatar upload
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      folder: 'irish-potatoes-avatars', // Optional: specify a folder in Cloudinary
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
