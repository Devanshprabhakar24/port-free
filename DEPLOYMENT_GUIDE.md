# 🚀 Portfolio Deployment Guide

This guide covers deploying your portfolio with frontend on **Vercel** and backend on **Render**.

---

## 📋 Prerequisites

- GitHub account with your repository
- Vercel account (free tier)
- Render account (free tier)
- Your email credentials ready

---

## 🎨 PART 1: Deploy Frontend (Vercel)

### Step 1: Prepare Frontend

1. Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your portfolio repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click **"Deploy"**

### Step 3: Get Your Frontend URL

After deployment completes, you'll get a URL like:

```
https://your-portfolio.vercel.app
```

Save this URL - you'll need it for the backend!

---

## ⚙️ PART 2: Deploy Backend (Render)

### Step 1: Prepare Backend

1. Create a `render.yaml` file in your project root (optional but recommended)

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `portfolio-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables

In Render dashboard, go to **Environment** tab and add these variables:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-portfolio.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=your-email@gmail.com
RECIPIENT_EMAIL=your-email@gmail.com
```

**Important**: Replace `FRONTEND_URL` with your actual Vercel URL!

4. Click **"Save Changes"** and wait for deployment

### Step 4: Get Your Backend URL

After deployment, you'll get a URL like:

```
https://portfolio-backend-xxxx.onrender.com
```

---

## 🔗 PART 3: Connect Frontend to Backend

### Update Frontend API URL

1. Update the Contact form to use your production backend URL:

Open `src/components/Contact/Contact.tsx` and change line 73:

```typescript
// Change from:
const response = await fetch('http://localhost:5000/api/contact/submit', {

// To:
const response = await fetch('https://your-backend-url.onrender.com/api/contact/submit', {
```

2. Commit and push:

```bash
git add .
git commit -m "feat: connect to production backend"
git push origin main
```

Vercel will automatically redeploy with the new changes!

---

## ✅ PART 4: Test Your Deployment

1. Visit your Vercel URL: `https://your-portfolio.vercel.app`
2. Navigate to the Contact section
3. Fill out the form and submit
4. Check:
   - ✅ You receive notification at dev24prabhakar@gmail.com
   - ✅ User receives auto-reply email
   - ✅ Success message appears on the form

---

## 🔧 Alternative Deployment Options

### Frontend Alternatives

#### Option 1: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your `dist` folder after running `npm run build`
3. Or connect GitHub repo with these settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Option 2: GitHub Pages

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: "/your-repo-name/",
  plugins: [react(), tailwindcss(), glsl()],
});
```

Deploy:

```bash
npm run deploy
```

### Backend Alternatives

#### Option 1: Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Railway auto-detects Node.js and deploys

#### Option 2: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create portfolio-backend

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set EMAIL_HOST=smtp.gmail.com
# ... add all other env vars

# Deploy
git subtree push --prefix backend heroku main
```

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Solution**: Make sure `FRONTEND_URL` in backend matches your actual frontend URL

### Issue: Email Not Sending

**Solution**:

1. Check Gmail App Password is correct
2. Verify Brevo API key is valid
3. Check Render logs: Dashboard → Logs tab

### Issue: Build Fails on Vercel

**Solution**:

1. Check Node version compatibility
2. Clear Vercel cache: Settings → Clear Cache
3. Check build logs for specific errors

### Issue: Backend Not Responding

**Solution**:

1. Check Render service is running (not sleeping)
2. Free tier sleeps after 15 min inactivity
3. First request may take 30-60 seconds to wake up

---

## 📊 Monitoring

### Check Backend Health

Visit: `https://your-backend-url.onrender.com/health`

Should return:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### View Logs

- **Vercel**: Dashboard → Deployments → Click deployment → Runtime Logs
- **Render**: Dashboard → Logs tab

---

## 💰 Cost Breakdown

### Free Tier Limits

**Vercel Free**:

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domain

**Render Free**:

- ✅ 750 hours/month
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 512MB RAM
- ✅ Automatic HTTPS

### Upgrade Recommendations

If you get traffic:

- **Vercel Pro** ($20/month): More bandwidth, better analytics
- **Render Starter** ($7/month): No sleep, 512MB RAM, always on

---

## 🎯 Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Render
3. ✅ Update API URL in frontend
4. ✅ Test contact form
5. 🎨 Add custom domain (optional)
6. 📊 Set up analytics (Google Analytics, Vercel Analytics)
7. 🔍 Add SEO meta tags
8. 🚀 Share your portfolio!

---

## 📝 Custom Domain Setup

### Add Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `devanshprabhakar.com`)
3. Update DNS records at your domain registrar:
   - Type: `A` → Value: `76.76.21.21`
   - Type: `CNAME` → Value: `cname.vercel-dns.com`

### Add Domain to Render

1. Go to Settings → Custom Domain
2. Add your domain (e.g., `api.devanshprabhakar.com`)
3. Update DNS:
   - Type: `CNAME` → Value: `your-service.onrender.com`

---

## 🔐 Security Checklist

- ✅ Environment variables set correctly
- ✅ `.env` file in `.gitignore`
- ✅ CORS configured with production URL
- ✅ Rate limiting enabled
- ✅ Helmet security headers active
- ✅ HTTPS enabled (automatic on Vercel/Render)

---

## 📞 Support

If you encounter issues:

1. Check deployment logs
2. Verify environment variables
3. Test backend health endpoint
4. Check CORS configuration

---

**Your portfolio is ready to go live! 🎉**
