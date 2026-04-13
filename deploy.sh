#!/bin/bash

# Portfolio Deployment Helper Script
# This script helps you prepare for deployment

echo "🚀 Portfolio Deployment Helper"
echo "================================"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes. Commit them first:"
    echo ""
    git status -s
    echo ""
    read -p "Do you want to commit all changes now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "❌ Please commit your changes before deploying"
        exit 1
    fi
fi

echo ""
echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""
echo "🔍 Checking backend dependencies..."
cd backend
npm install --production
cd ..
echo "✅ Backend dependencies checked"

echo ""
echo "🎯 Deployment Checklist:"
echo "========================"
echo ""
echo "Frontend (Vercel):"
echo "  1. Go to https://vercel.com"
echo "  2. Import your GitHub repository"
echo "  3. Deploy with default Vite settings"
echo ""
echo "Backend (Render):"
echo "  1. Go to https://render.com"
echo "  2. Create new Web Service"
echo "  3. Connect your GitHub repository"
echo "  4. Set Root Directory: backend"
echo "  5. Add environment variables from backend/.env"
echo ""
echo "After Deployment:"
echo "  1. Get your backend URL from Render"
echo "  2. Update src/config/api.ts with your backend URL"
echo "  3. Commit and push changes"
echo "  4. Vercel will auto-redeploy"
echo ""
echo "✅ Ready to deploy!"
echo ""
read -p "Push to GitHub now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    echo "✅ Pushed to GitHub"
    echo ""
    echo "🎉 Now go to Vercel and Render to complete deployment!"
else
    echo "⏸️  Push skipped. Run 'git push origin main' when ready."
fi
