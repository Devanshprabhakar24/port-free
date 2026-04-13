# Portfolio Backend API

Scalable Node.js/Express backend for portfolio contact form with email notifications.

## Features

- ✅ RESTful API architecture
- ✅ Dual email system: SMTP + Brevo API
- ✅ SMTP for notifications to you
- ✅ Brevo API for auto-reply to users
- ✅ Rate limiting for security
- ✅ Input validation and sanitization
- ✅ Spam detection
- ✅ CORS enabled
- ✅ Helmet security headers
- ✅ Compression middleware
- ✅ Error handling
- ✅ Request logging

## Tech Stack

- Node.js
- Express.js
- Nodemailer (SMTP)
- Brevo API (@sendinblue/client)
- Helmet (Security)
- Express Rate Limit
- Morgan (Logging)
- Compression

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# SMTP Configuration (for sending notifications to yourself)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-smtp-password

# Brevo API Configuration (for auto-reply to users)
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=your-verified-sender@domain.com

# Recipient Email
RECIPIENT_EMAIL=your-email@gmail.com
```

### 3. Setup Instructions

#### SMTP Setup (Gmail):

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate a new app password for "Mail"
5. Use this password in `EMAIL_PASSWORD`

#### Brevo API Setup:

1. Sign up at https://www.brevo.com
2. Go to SMTP & API → API Keys
3. Create a new API key
4. Add verified sender email in Senders & IP
5. Use API key in `BREVO_API_KEY`

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 5. Run Production Server

```bash
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "OK",
  "timestamp": "2026-04-13T...",
  "uptime": 123.45
}
```

### Submit Contact Form

```
POST /api/contact/submit
```

Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here..."
}
```

Response:

```json
{
  "success": true,
  "message": "Message sent successfully! I'll reply within 24 hours."
}
```

## Security Features

- Rate limiting: 5 requests per hour per IP for contact form
- Input validation and sanitization
- Spam detection
- Helmet security headers
- CORS protection
- Request size limits

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── routes/
│   │   └── contact.routes.js  # Contact routes
│   ├── controllers/
│   │   └── contact.controller.js  # Contact logic
│   └── middleware/
│       ├── validation.js      # Input validation
│       └── errorHandler.js    # Error handling
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Deployment

### Vercel/Railway/Render

1. Push code to GitHub
2. Connect repository to platform
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
RECIPIENT_EMAIL=dev24prabhakar@gmail.com
```

## Future Enhancements

- [ ] MongoDB integration for storing messages
- [ ] Admin dashboard
- [ ] JWT authentication
- [ ] File upload support
- [ ] Analytics tracking
- [ ] Email templates
- [ ] Multiple language support

## License

ISC
