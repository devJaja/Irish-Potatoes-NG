const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const crypto = require('crypto');
const User = require('../models/User');
const {
  sendEmail,
  getWelcomeEmailHTML,
  getPasswordResetEmailHTML,
  getOTPEmailHTML,
} = require('../utils/email');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation Schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  address: Joi.object({
    street: Joi.string().required(),
    state: Joi.string().required(),
    // city and zipCode are optional for now based on current frontend data
    city: Joi.string().optional(),
    zipCode: Joi.string().optional()
  }).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().optional(),
    zipCode: Joi.string().optional()
  }).optional(),
  avatar: Joi.string().uri().optional(), // Allow optional avatar URL
});

// Register
router.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const { name, email, password, phone, address } = req.body;
    const user = new User({
      name,
      email,
      password,
      phone,
      address,
    });
    await user.save();

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Irish Potatoes!',
      html: getWelcomeEmailHTML(user.name),
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { error } = updateProfileSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Update fields if provided
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;
    if (req.body.avatar) user.avatar = req.body.avatar;

    await user.save();

    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during profile update.' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { error } = emailSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: getPasswordResetEmailHTML(resetUrl),
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired.' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { error } = emailSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send OTP email
    await sendEmail({
      to: user.email,
      subject: 'Your One-Time Password (OTP)',
      html: getOTPEmailHTML(otp),
    });

    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
});

module.exports = router;