const nodemailer = require('nodemailer');
const SibApiV3Sdk = require('@sendinblue/client');
const { asyncHandler } = require('../middleware/errorHandler');

// SMTP transporter for sending to yourself
const createSMTPTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: true, // true for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  return transporter;
};

// Brevo API client for auto-reply
const createBrevoClient = () => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  return apiInstance;
};

// Submit contact form
exports.submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // 1. Send notification to yourself via SMTP
    try {
      const smtpTransporter = createSMTPTransporter();
      const notificationOptions = {
        from: `"Portfolio Contact" <${process.env.BREVO_FROM_EMAIL}>`,
        to: process.env.RECIPIENT_EMAIL || 'dev24prabhakar@gmail.com',
        subject: `Portfolio Contact: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">New Contact Form Submission</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px;">
              Sent from your portfolio contact form at ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        replyTo: email
      };

      await smtpTransporter.sendMail(notificationOptions);
      console.log('✅ SMTP notification sent to:', process.env.RECIPIENT_EMAIL);
    } catch (smtpError) {
      console.error('⚠️ SMTP notification failed:', smtpError.message);
      // Continue even if SMTP fails
    }

    // 2. Send auto-reply to user via Brevo API
    try {
      const brevoClient = createBrevoClient();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.sender = {
        name: 'Devansh Prabhakar',
        email: process.env.BREVO_FROM_EMAIL
      };
      sendSmtpEmail.to = [{ email: email, name: name }];
      sendSmtpEmail.subject = 'Thanks for reaching out!';
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Hi ${name}!</h2>
          <p>Thanks for reaching out. I've seen your message and will respond within 24 hours.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>Best regards,<br>Devansh Prabhakar</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Email: dev24prabhakar@gmail.com<br>
            Phone: +91 8009968319<br>
            Website: <a href="https://devanshprabhakar.com" style="color: #7c3aed;">devanshprabhakar.com</a>
          </p>
        </div>
      `;

      await brevoClient.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Brevo auto-reply sent to:', email);
    } catch (brevoError) {
      console.error('⚠️ Brevo auto-reply failed:', brevoError.message);
      // Continue even if Brevo fails
    }

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! I\'ll reply within 24 hours.'
    });
  } catch (error) {
    console.error('❌ Email error:', error);
    // Return success anyway so user doesn't see error
    res.status(200).json({
      success: true,
      message: 'Message received! I\'ll reply within 24 hours.'
    });
  }
});
