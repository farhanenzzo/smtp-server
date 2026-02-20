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
      from: `"PayWifiBill" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: refererEmail,
      subject: `Referral: ${refererName} referred ${friendName}`,
      html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1d1d1f;">
      
      <div style="margin-bottom: 40px;">
        <p style="font-size: 14px; font-weight: 600; color: #0071e3; margin-bottom: 8px; letter-spacing: -0.01em;">Referral Program</p>
        <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.02em; margin: 0;">New referral received.</h1>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #f2f2f2; border-radius: 12px; padding: 32px;">
        
        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #86868b; margin-bottom: 16px;">Referrer Details</h2>
        <div style="margin-bottom: 32px;">
          <p style="margin: 4px 0; font-size: 15px;"><strong>${refererName}</strong></p>
          <p style="margin: 4px 0; font-size: 15px; color: #515154;">${refererEmail}</p>
          <p style="margin: 4px 0; font-size: 15px; color: #515154;">${refererPhone || 'No phone provided'}</p>
        </div>

        <div style="height: 1px; background-color: #f2f2f2; margin-bottom: 32px;"></div>

        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #86868b; margin-bottom: 16px;">Referred Friend</h2>
        <div>
          <p style="margin: 4px 0; font-size: 15px;"><strong>${friendName}</strong></p>
          <p style="margin: 4px 0; font-size: 15px; color: #515154;">${friendPhone}</p>
        </div>

      </div>

      <div style="margin-top: 40px; padding: 0 32px; text-align: center;">
        <p style="font-size: 12px; color: #86868b; line-height: 1.5;">
          Sent via PayWifiBill Subscriber Portal.<br />
          This is an automated notification regarding your referral program.
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
