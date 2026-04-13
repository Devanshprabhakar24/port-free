# 🔧 Fix Render Backend Deployment

## The Problem

Render is trying to run `npm run build` but your backend doesn't need a build step.

## ✅ Solution: Update Render Settings

### Go to your Render dashboard:

1. Open your service: **port-free**
2. Click **"Settings"** tab
3. Update these settings:

### Build & Deploy Settings:

**Root Directory:**

```
backend
```

**Build Command:**

```
npm install
```

**Start Command:**

```
npm start
```

**Auto-Deploy:**

- ✅ Yes (enabled)

### Environment Variables:

Make sure these are set (Settings → Environment):

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-vercel-url.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=your-email@gmail.com
RECIPIENT_EMAIL=your-email@gmail.com
```

### Save and Redeploy:

1. Click **"Save Changes"**
2. Go to **"Manual Deploy"** → **"Deploy latest commit"**

---

## Alternative: Delete and Recreate Service

If the above doesn't work:

1. **Delete the current service** (Settings → Delete Service)
2. **Create new Web Service**:
   - Repository: Your GitHub repo
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Branch**: `main`
3. Add all environment variables
4. Click **"Create Web Service"**

---

## ✅ Verify It Works

After deployment succeeds, test:

```bash
curl https://port-free.onrender.com/health
```

Should return:

```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": 123.456
}
```

---

## 🎯 Quick Checklist

- [ ] Root Directory = `backend`
- [ ] Build Command = `npm install` (NOT `npm run build`)
- [ ] Start Command = `npm start`
- [ ] All environment variables added
- [ ] Service redeployed
- [ ] Health check passes

---

**After fixing, your backend will be live at:**
`https://port-free.onrender.com`
