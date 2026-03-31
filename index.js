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

let transportStatus = { ready: false, error: null };

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
    transportStatus.error = error.message;
  } else {
    console.log('Email server is ready to send messages');
    transportStatus.ready = true;
  }
});

// Root status page
app.get('/', (req, res) => {
  const isOk = transportStatus.ready;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Status | PayWifiBill</title>
        <style>
            body { font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f7; color: #1d1d1f; }
            .card { background: white; padding: 2.5rem; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; max-width: 440px; width: 90%; }
            h1 { margin: 0 0 1rem; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
            p { color: #86868b; line-height: 1.5; margin-bottom: 2rem; font-size: 15px; }
            .status { display: inline-block; padding: 0.6rem 1.2rem; border-radius: 100px; font-weight: 600; font-size: 14px; letter-spacing: -0.01em; }
            .status.ok { background: #e8f5e9; color: #2e7d32; }
            .status.error { background: #fff1f0; color: #e03131; }
            .error-box { margin-top: 1.5rem; font-size: 13px; color: #e03131; background: #fff5f5; padding: 1rem; border-radius: 12px; text-align: left; line-height: 1.4; border: 1px solid #ffc9c9; }
            .badge { font-family: monospace; background: #f4f4f7; padding: 2px 6px; border-radius: 4px; color: #1d1d1f; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1 style="color: #0071e3;">PayWifiBill SMTP</h1>
            <p>The email server for the referral system is currently active.</p>
            <div class="status ${isOk ? 'ok' : 'error'}">
                ${isOk ? '● System Operational' : '● Configuration Issue'}
            </div>
            ${!isOk ? `
                <div class="error-box">
                    <strong style="display: block; margin-bottom: 4px;">Transporter Error:</strong>
                    ${transportStatus.error || 'The SMTP transporter could not be verified. Please check your environment variables.'}
                    <div style="margin-top: 10px; font-size: 11px; color: #86868b;">
                        Ensure <span class="badge">EMAIL_USER</span> and <span class="badge">EMAIL_PASS</span> are set correctly in Vercel.
                    </div>
                </div>
            ` : ''}
            <div style="margin-top: 2.5rem; font-size: 12px; color: #86868b; border-top: 1px solid #f2f2f2; padding-top: 1.5rem;">
                v1.0.0 &bull; Running on Node.js
            </div>
        </div>
    </body>
    </html>
  `);
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
