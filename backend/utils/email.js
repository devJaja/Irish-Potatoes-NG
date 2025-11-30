const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOrderEmail = async (order) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.user.email,
      subject: 'Order Confirmation - Irish Potatoes',
      html: `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order!</p>
        <p>Order ID: ${order._id}</p>
        <p>Total Amount: ₦${order.totalAmount.toLocaleString()}</p>
        <p>We'll notify you when your order is shipped.</p>
      `
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

module.exports = { sendOrderEmail };
