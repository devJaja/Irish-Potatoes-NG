const nodemailer = require("nodemailer");

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

/**
 * Sends an email using the pre-configured transporter.
 *
 * @param {object} mailOptions - The mail options (to, subject, html).
 * @returns {Promise<void>}
 */
const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    // In a real app, you'd want more robust error handling
    // For this flow, we will not throw, to prevent order creation from failing if email fails
  }
};

/**
 * Generates the HTML for an order confirmation email.
 *
 * @param {object} order - The populated order object.
 * @returns {string} The email's HTML content.
 */
const getOrderConfirmationHTML = (order) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product.name} (x${item.quantity})</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₦${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Your Order is Confirmed!</h2>
      <p>Hello ${order.user.name},</p>
      <p>Thank you for your purchase. We've received your order and are getting it ready.</p>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Product</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 8px; text-align: right;"><strong>Discount:</strong></td>
            <td style="padding: 8px; text-align: right;">- ₦${order.discount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 8px; font-weight: bold; text-align: right;">₦${order.totalAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top: 20px;">We will notify you again once your order has shipped.</p>
      <br/>
      <p>Best regards,</p>
      <p><strong>The Plateau Potatoes Team</strong></p>
    </div>
  `;
};

/**
 * Sends an order confirmation email.
 *
 * @param {object} order - The populated order object.
 */
const sendOrderEmail = async (order) => {
  if (!order.user || !order.user.email) {
    console.error("Cannot send order email, user details are missing.");
    return;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: order.user.email,
    subject: `Order Confirmation - #${order.orderId}`,
    html: getOrderConfirmationHTML(order),
  };

  await sendEmail(mailOptions);
};


/**
 * Generates the HTML for a welcome email.
 *
 * @param {string} name - The user's name.
 * @returns {string} The email's HTML content.
 */
const getWelcomeEmailHTML = (name) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Welcome to Plateau Potatoes, ${name}!</h2>
    <p>Thank you for registering on our platform. We're excited to have you.</p>
    <p>You can now browse our delicious Plateau potatoes and other products.</p>
    <p>If you have any questions, don't hesitate to contact us.</p>
    <p>Happy shopping!</p>
    <br/>
    <p>Best regards,</p>
    <p>The Plateau Potatoes Team</p>
  </div>
`;

/**
 * Generates the HTML for a password reset email.
 *
 * @param {string} resetLink - The password reset link.
 * @returns {string} The email's HTML content.
 */
const getPasswordResetEmailHTML = (resetLink) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Password Reset Request</h2>
    <p>You are receiving this email because a password reset was requested for your account.</p>
    <p>Please click the link below to reset your password. This link is valid for 1 hour.</p>
    <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
    <br/>
    <p>Best regards,</p>
    <p>The Plateau Potatoes Team</p>
  </div>
`;

/**
 * Generates the HTML for an OTP email.
 *
 * @param {string} otp - The One-Time Password.
 * @returns {string} The email's HTML content.
 */
const getOTPEmailHTML = (otp) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Your One-Time Password (OTP)</h2>
    <p>Use the following OTP to complete your action. This OTP is valid for 10 minutes.</p>
    <h3 style="letter-spacing: 2px;">${otp}</h3>
    <p>If you did not request this OTP, please ignore this email or contact support if you have concerns.</p>
    <br/>
    <p>Best regards,</p>
    <p>The Plateau Potatoes Team</p>
  </div>
`;

const getOrderStatusUpdateHTML = (order, status) => {
  const statusMessages = {
    processing: "is being processed.",
    shipped: "has been shipped.",
    delivered: "has been delivered.",
    cancelled: "has been cancelled.",
  };

  const message = statusMessages[status] || `has been updated to ${status}.`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Your Order Status has been Updated!</h2>
      <p>Hello ${order.user.name},</p>
      <p>The status of your order #${order.orderId} ${message}</p>
      
      <p style="margin-top: 20px;">You can view your order details here: [Link to order page]</p>
      <br/>
      <p>Best regards,</p>
      <p><strong>The Plateau Potatoes Team</strong></p>
    </div>
  `;
};

const sendOrderStatusUpdateEmail = async (order, status) => {
  if (!order.user || !order.user.email) {
    console.error("Cannot send order status email, user details are missing.");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: order.user.email,
    subject: `Your Order #${order.orderId} has been ${status}`,
    html: getOrderStatusUpdateHTML(order, status),
  };

  await sendEmail(mailOptions);
};

module.exports = {
  sendEmail,
  sendOrderEmail, // Export the new function
  getWelcomeEmailHTML,
  getPasswordResetEmailHTML,
  getOTPEmailHTML,
  sendOrderStatusUpdateEmail,
};