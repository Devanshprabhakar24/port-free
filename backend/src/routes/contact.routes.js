const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contact.controller');
const { validateContact } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Stricter rate limit for contact form
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per hour
    message: 'Too many contact submissions, please try again later.'
});

router.post('/submit', contactLimiter, validateContact, submitContact);

module.exports = router;
