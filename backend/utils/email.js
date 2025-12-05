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
    throw new Error("Email could not be sent.");
  }
};

/**
 * Generates the HTML for a welcome email.
 *
 * @param {string} name - The user's name.
 * @returns {string} The email's HTML content.
 */
const getWelcomeEmailHTML = (name) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Welcome to Irish Potatoes, ${name}!</h2>
    <p>Thank you for registering on our platform. We're excited to have you.</p>
    <p>You can now browse our delicious Irish potatoes and other products.</p>
    <p>If you have any questions, don't hesitate to contact us.</p>
    <p>Happy shopping!</p>
    <br/>
    <p>Best regards,</p>
    <p>The Irish Potatoes Team</p>
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
    <p>The Irish Potatoes Team</p>
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
    <p>The Irish Potatoes Team</p>
  </div>
`;

module.exports = {
  sendEmail,
  getWelcomeEmailHTML,
  getPasswordResetEmailHTML,
  getOTPEmailHTML,
};