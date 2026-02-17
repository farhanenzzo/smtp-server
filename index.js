require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Refer Friend endpoint
app.post('/api/refer-friend', async (req, res) => {
  try {
    const { refererName, refererEmail, refererPhone, friendName, friendPhone } = req.body;

    // Validation
    if (!refererName || !refererEmail || !friendName || !friendPhone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    // Email content
    const mailOptions = {
      from: `"PayWifiBill Referral" <${process.env.EMAIL_USER}>`,
      to: process.env.ORG_EMAIL || 'farhan.enzo99@gmail.com',
      replyTo: refererEmail,
      subject: `🎉 New Referral from ${refererName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Friend Referral</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Referrer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${refererName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Email:</td>
                <td style="padding: 8px 0; color: #1e293b;">${refererEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Phone:</td>
                <td style="padding: 8px 0; color: #1e293b;">${refererPhone || 'Not provided'}</td>
              </tr>
            </table>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            
            <h2 style="color: #1e293b; font-size: 18px;">Friend Being Referred</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${friendName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Phone:</td>
                <td style="padding: 8px 0; color: #1e293b;">${friendPhone}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: #94a3b8; margin: 0; font-size: 14px;">
              PayWifiBill Subscriber Portal
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      status: 'success',
      message: 'Referral submitted successfully! We will contact your friend soon.',
    });
  } catch (error) {
    console.error('Error sending referral email:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send referral. Please try again later.',
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
