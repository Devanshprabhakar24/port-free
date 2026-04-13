# ⚡ Quick Deploy Guide (5 Minutes)

## 🎯 Step 1: Deploy Frontend (2 min)

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Add New Project"**
3. Select your GitHub repository
4. Click **"Deploy"** (use default settings)
5. ✅ Done! Copy your URL: `https://your-site.vercel.app`

---

## 🎯 Step 2: Deploy Backend (2 min)

1. Go to **[render.com](https://render.com)**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add **Environment Variables** (click "Advanced" → "Add Environment Variable"):

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-site.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=your-email@gmail.com
RECIPIENT_EMAIL=your-email@gmail.com
```

6. Click **"Create Web Service"**
7. ✅ Done! Copy your URL: `https://your-backend.onrender.com`

---

## 🎯 Step 3: Connect Them (1 min)

1. Open `src/config/api.ts`
2. Replace line 7:

```typescript
BACKEND_URL: isProduction
  ? 'https://your-backend.onrender.com' // ← Put your Render URL here
  : 'http://localhost:5000',
```

3. Save, commit, and push:

```bash
git add .
git commit -m "feat: connect to production backend"
git push origin main
```

4. ✅ Vercel auto-deploys! Wait 1 minute.

---

## 🎉 Step 4: Test It!

1. Visit your Vercel URL
2. Go to Contact section
3. Submit a test message
4. Check your email: dev24prabhakar@gmail.com

---

## ⚠️ Important Notes

- **Render Free Tier**: Backend sleeps after 15 min of inactivity
- **First Request**: May take 30-60 seconds to wake up
- **Solution**: Upgrade to Render Starter ($7/month) for always-on

---

## 🐛 Troubleshooting

### Contact form not working?

1. Check Render logs: Dashboard → Logs
2. Verify environment variables are set
3. Test backend health: `https://your-backend.onrender.com/health`

### CORS error?

- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly

---

## 🚀 You're Live!

Share your portfolio:

- 🌐 Website: `https://your-site.vercel.app`
- 📧 Email: dev24prabhakar@gmail.com
- 💼 LinkedIn: Update your profile with the link!

---

**Need detailed instructions?** See `DEPLOYMENT_GUIDE.md`
