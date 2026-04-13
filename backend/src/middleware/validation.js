// Validation middleware
exports.validateContact = (req, res, next) => {
    const { name, email, message } = req.body;

    // Validation rules
    const errors = [];

    // Name validation
    if (!name || name.trim().length === 0) {
        errors.push('Name is required');
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    } else if (name.trim().length > 100) {
        errors.push('Name must be less than 100 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
        errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
    }

    // Message validation
    if (!message || message.trim().length === 0) {
        errors.push('Message is required');
    } else if (message.trim().length < 10) {
        errors.push('Message must be at least 10 characters');
    } else if (message.trim().length > 5000) {
        errors.push('Message must be less than 5000 characters');
    }

    // Check for spam patterns
    const spamPatterns = [
        /viagra/i,
        /cialis/i,
        /casino/i,
        /lottery/i,
        /\b(click here|buy now)\b/i
    ];

    const hasSpam = spamPatterns.some(pattern =>
        pattern.test(name) || pattern.test(email) || pattern.test(message)
    );

    if (hasSpam) {
        errors.push('Message contains prohibited content');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    // Sanitize inputs
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.message = message.trim();

    next();
};
