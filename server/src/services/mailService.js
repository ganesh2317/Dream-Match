const { Resend } = require('resend');

/**
 * Mail Service — uses Resend HTTP API.
 *
 * Why not SMTP/Nodemailer?
 *   Render free tier blocks ALL outbound TCP on ports 465 & 587.
 *   Confirmed: error.code=ETIMEDOUT, error.command=CONN on both ports.
 *   Resend uses HTTPS (port 443) which is always open.
 *
 * Sandbox restriction:
 *   Without a verified domain, Resend can only deliver to the account
 *   owner's email. To lift this, verify a domain at resend.com/domains
 *   and set FROM_EMAIL=otp@yourdomain.com in environment variables.
 */

const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        throw new Error('RESEND_API_KEY environment variable is not set');
    }
    return new Resend(key);
};

const FROM = process.env.FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Sends a test email.
 * @param {string} email
 */
const sendTestEmail = async (email) => {
    console.log('--- Resend Send Test Email Initiated ---');
    console.log('Recipient:', email);
    console.log('From:     ', FROM);

    const resend = getResend();
    const payload = {
        from: FROM,
        to: email,
        subject: 'Dream Match Email Test',
        html: '<p>This is a test email. If you received this, Dream Match email delivery is working.</p>'
    };

    console.log('Payload:', JSON.stringify(payload));

    try {
        const result = await resend.emails.send(payload);
        console.log('Resend API Succeeded');
        console.log('Result:', JSON.stringify(result, null, 2));
        console.log('----------------------------------------');

        if (result.error) {
            console.error('Resend returned error:', result.error);
            throw new Error(result.error.message || 'Resend API error');
        }

        return result;
    } catch (error) {
        console.error('Resend API Failed');
        console.error('Message:', error.message);
        console.error('Stack:  ', error.stack);
        console.log('----------------------------------------');
        throw error;
    }
};

/**
 * Sends a 4-digit OTP verification email.
 * @param {string} email
 * @param {string} fullName
 * @param {string} otp
 */
const sendVerificationOtpEmail = async (email, fullName, otp) => {
    console.log('--- Resend Send OTP Email Initiated ---');
    console.log('Recipient:', email);
    console.log('From:     ', FROM);
    console.log('Subject:   Verify your Dream Match account');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Dream Match account</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f6; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; padding: 20px; }
    .card { background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef0f2; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg,#6366f1,#a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; display: inline-block; }
    h1 { color: #1a1f36; font-size: 22px; font-weight: 700; margin: 0 0 16px; }
    p { color: #4f566b; font-size: 16px; line-height: 24px; margin: 0 0 24px; }
    .otp { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6366f1; display: inline-block; margin-bottom: 24px; min-width: 160px; }
    .footer { color: #a3acb9; font-size: 13px; margin-top: 32px; border-top: 1px solid #eef0f2; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">✨ Dream Match</div>
      <h1>Verify your account</h1>
      <p>Hello ${fullName},</p>
      <p>Use the code below to complete your registration. It expires in <strong>5 minutes</strong>.</p>
      <div class="otp">${otp}</div>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <div class="footer">&copy; 2026 Dream Match. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;

    const resend = getResend();
    const payload = {
        from: FROM,
        to: email,
        subject: 'Verify your Dream Match account',
        html
    };

    try {
        const result = await resend.emails.send(payload);
        console.log('Resend OTP Email Succeeded');
        console.log('Result:', JSON.stringify(result, null, 2));
        console.log('----------------------------------------');

        if (result.error) {
            console.error('Resend returned error:', result.error);
            throw new Error(result.error.message || 'Resend API error');
        }

        return result;
    } catch (error) {
        console.error('Resend OTP Email Failed');
        console.error('Message:', error.message);
        console.error('Stack:  ', error.stack);
        console.log('----------------------------------------');
        throw error;
    }
};

module.exports = { sendTestEmail, sendVerificationOtpEmail };
