const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Testing SMTP only...\n');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const mailOptions = {
    from: `"Portfolio Test" <${process.env.EMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject: 'Test Email from Portfolio Backend',
    html: `
    <h2>Test Email</h2>
    <p>If you receive this, SMTP is working correctly!</p>
    <p>Sent at: ${new Date().toLocaleString()}</p>
  `
};

transporter.sendMail(mailOptions)
    .then(info => {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\n📬 Check your email at:', process.env.RECIPIENT_EMAIL);
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
    });
