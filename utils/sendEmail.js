const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-specific-password'
  }
});

// Email template function
const createEmailTemplate = (subject, message) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4f46e5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 20px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4f46e5;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            margin: 15px 0;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Bank Customer Segmentation</h2>
        </div>
        <div class="content">
          ${message}
          <div class="footer">
            <p>This is an automated message, please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Bank Customer Segmentation. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Send email function
const sendEmail = async ({ email, subject, message }) => {
  try {
    // In production, use a real email service
    if (process.env.NODE_ENV === 'production') {
      const mailOptions = {
        from: `"Bank Customer Segmentation" <${process.env.SMTP_USER || 'noreply@bankseg.com'}>`,
        to: email,
        subject: subject,
        html: createEmailTemplate(subject, message)
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return true;
    } else {
      // In development, just log the email
      console.log('Email would be sent to:', email);
      console.log('Subject:', subject);
      console.log('Message:', message);
      return true;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;
