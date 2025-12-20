const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Debugging: Log environment variables to check if they are loaded
console.log('--- Cloudinary Configuration ---');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret is set:', !!process.env.CLOUDINARY_API_SECRET);
console.log('------------------------------');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
