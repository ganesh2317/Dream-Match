const nodemailer = require('nodemailer');

/**
 * Sends a test email directly using Nodemailer
 * @param {string} email 
 */
const sendTestEmail = async (email) => {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const subject = 'Dream Match Email Test';
    const html = `<p>This is a test email.</p><p>If you received this, Dream Match email delivery is working.</p>`;
    
    console.log('--- Nodemailer Send Test Email Initiated ---');
    console.log('Recipient:', email);
    console.log('Sender (SMTP_USER):', smtpUser);
    console.log('Subject:', subject);
    
    if (!smtpUser || !smtpPass) {
        throw new Error('SMTP_USER and SMTP_PASS environment variables are not defined');
    }

    // Port 587 + STARTTLS — port 465 (SMTPS) is blocked on Render's free tier (ETIMEDOUT on CONN)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    // Verify transporter configuration
    try {
        console.log('Verifying SMTP transporter configuration...');
        await transporter.verify();
        console.log('SMTP Transporter configuration is verified and ready.');
    } catch (verifyError) {
        console.error('SMTP Transporter verification failed:');
        console.error('Complete Verification Error Object:', verifyError);
        console.error('Verification Error Stack:', verifyError.stack);
        throw verifyError;
    }

    const mailOptions = {
        from: `"Dream Match" <${smtpUser}>`,
        to: email,
        subject: subject,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Nodemailer SMTP Call Succeeded');
        console.log('Message ID:', info.messageId);
        console.log('Accepted:', info.accepted);
        console.log('Rejected:', info.rejected);
        console.log('Response:', info.response);
        console.log('----------------------------------------');
        return info;
    } catch (error) {
        console.error('Nodemailer SMTP Call Failed');
        console.error('Complete Error Object:', error);
        console.error('Error Stack:', error.stack);
        console.log('----------------------------------------');
        throw error;
    }
};

/**
 * Sends a professional 4-digit verification code to the user's email using Nodemailer
 * @param {string} email 
 * @param {string} fullName 
 * @param {string} otp 
 */
const sendVerificationOtpEmail = async (email, fullName, otp) => {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const subject = 'Verify your Dream Match account';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your Dream Match account</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #f4f5f6;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .container {
                max-width: 500px;
                margin: 40px auto;
                padding: 20px;
            }
            .card {
                background: #ffffff;
                border-radius: 16px;
                padding: 40px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                border: 1px solid #eef0f2;
                text-align: center;
            }
            .logo {
                font-size: 28px;
                font-weight: 800;
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 24px;
                display: inline-block;
            }
            h1 {
                color: #1a1f36;
                font-size: 22px;
                font-weight: 700;
                margin: 0 0 16px 0;
            }
            p {
                color: #4f566b;
                font-size: 16px;
                line-height: 24px;
                margin: 0 0 24px 0;
            }
            .otp-container {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 6px;
                color: #6366f1;
                display: inline-block;
                margin-bottom: 24px;
                min-width: 160px;
            }
            .footer {
                color: #a3acb9;
                font-size: 13px;
                margin-top: 32px;
                border-top: 1px solid #eef0f2;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="logo">✨ Dream Match</div>
                <h1>Verify your Dream Match account</h1>
                <p>Hello ${fullName},</p>
                <p>Thank you for signing up for Dream Match. Please use the verification code below to complete your registration:</p>
                <div class="otp-container">${otp}</div>
                <p>This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
                <div class="footer">
                    &copy; 2026 Dream Match. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    console.log('--- Nodemailer Send OTP Email Initiated ---');
    console.log('Recipient:', email);
    console.log('Sender (SMTP_USER):', smtpUser);
    console.log('Subject:', subject);

    if (!smtpUser || !smtpPass) {
        throw new Error('SMTP_USER and SMTP_PASS environment variables are not defined');
    }

    // Port 587 + STARTTLS — port 465 (SMTPS) is blocked on Render's free tier (ETIMEDOUT on CONN)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    // Verify transporter configuration
    try {
        console.log('Verifying SMTP transporter configuration...');
        await transporter.verify();
        console.log('SMTP Transporter configuration is verified and ready.');
    } catch (verifyError) {
        console.error('SMTP Transporter verification failed:');
        console.error('Complete Verification Error Object:', verifyError);
        console.error('Verification Error Stack:', verifyError.stack);
        throw verifyError;
    }

    const mailOptions = {
        from: `"Dream Match" <${smtpUser}>`,
        to: email,
        subject: subject,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Nodemailer SMTP Call Succeeded');
        console.log('Message ID:', info.messageId);
        console.log('Accepted:', info.accepted);
        console.log('Rejected:', info.rejected);
        console.log('Response:', info.response);
        console.log('----------------------------------------');
        return info;
    } catch (error) {
        console.error('Nodemailer SMTP Call Failed');
        console.error('Complete Error Object:', error);
        console.error('Error Stack:', error.stack);
        console.log('----------------------------------------');
        throw error;
    }
};

module.exports = {
    sendVerificationOtpEmail,
    sendTestEmail
};
