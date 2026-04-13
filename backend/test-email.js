const axios = require('axios');

const testData = {
    name: 'Test User',
    email: 'testuser@example.com',
    message: 'This is a test message from your portfolio contact form.\n\nTesting both SMTP and Brevo API integration.\n\nIf you receive this email at devansh24prabhakar@gmail.com, the system is working correctly!'
};

console.log('🧪 Testing contact form API...\n');
console.log('Sending test data:', JSON.stringify(testData, null, 2));
console.log('\n📧 Expected behavior:');
console.log('1. You should receive a notification at: devansh24prabhakar@gmail.com');
console.log('2. testuser@example.com should receive an auto-reply\n');

axios.post('http://localhost:5000/api/contact/submit', testData)
    .then(response => {
        console.log('✅ Success!');
        console.log('Response:', response.data);
        console.log('\n📬 Check your email at devansh24prabhakar@gmail.com');
    })
    .catch(error => {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.data?.errors) {
            console.error('Validation errors:', error.response.data.errors);
        }
    });
