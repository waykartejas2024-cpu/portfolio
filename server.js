require('dotenv').config();
const express = require('express');
const path = require('path');

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio configured.');
  } catch (e) {
    console.warn('Twilio package not installed or failed to initialize. Falling back to demo mode.');
    twilioClient = null;
  }
}

const app = express();
app.use(express.json());
// Serve static files from project root so you can open /portfolio/otp.html
app.use(express.static(path.join(__dirname)));

// Simple in-memory store (for demo). Map from destination -> { otp, expiry }
const store = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/send-otp', async (req, res) => {
  const { to } = req.body || {};
  if (!to) return res.status(400).json({ success: false, error: 'missing_destination' });

  const otp = generateOTP();
  const expiry = Date.now() + 60 * 1000; // 60s
  store.set(to, { otp, expiry });

  // If Twilio configured and FROM number present, attempt to send SMS
  if (twilioClient && process.env.TWILIO_FROM) {
    try {
      await twilioClient.messages.create({ body: `Your OTP is ${otp}`, from: process.env.TWILIO_FROM, to });
      return res.json({ success: true, sent: true });
    } catch (err) {
      console.error('Twilio send error:', err && err.message ? err.message : err);
      return res.status(500).json({ success: false, error: 'twilio_error', detail: err && err.message });
    }
  }

  // Demo fallback: log the OTP server-side and return it in the response for convenience/testing
  console.log(`Demo OTP for ${to}: ${otp}`);
  return res.json({ success: true, sent: false, otp });
});

app.post('/api/verify-otp', (req, res) => {
  const { to, otp } = req.body || {};
  if (!to || !otp) return res.status(400).json({ success: false, error: 'missing_params' });

  const record = store.get(to);
  if (!record) return res.json({ success: false, reason: 'no_otp' });

  if (Date.now() > record.expiry) {
    store.delete(to);
    return res.json({ success: false, reason: 'expired' });
  }

  if (otp === record.otp) {
    store.delete(to);
    return res.json({ success: true });
  }

  return res.json({ success: false, reason: 'invalid' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
