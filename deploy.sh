#!/bin/bash

# Project BASTION - Vercel Deployment Script
echo "🚀 Deploying Project BASTION to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Deploy Backend
echo "📡 Deploying Backend API..."
cd backend
vercel --prod --yes
if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully"
else
    echo "❌ Backend deployment failed"
    exit 1
fi

# Deploy Bastion Frontend
echo "🖥️  Deploying Bastion Frontend (Admin Dashboard)..."
cd ../bastion-frontend
vercel --prod --yes
if [ $? -eq 0 ]; then
    echo "✅ Bastion Frontend deployed successfully"
else
    echo "❌ Bastion Frontend deployment failed"
    exit 1
fi

# Deploy Storefront Frontend
echo "🛒 Deploying Storefront Frontend..."
cd ../storefront-frontend
vercel --prod --yes
if [ $? -eq 0 ]; then
    echo "✅ Storefront Frontend deployed successfully"
else
    echo "❌ Storefront Frontend deployment failed"
    exit 1
fi

echo ""
echo "🎉 All components deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard for each project"
echo "2. Update CORS origins in backend with your actual frontend URLs"
echo "3. Test the complete fraud detection workflow"
echo ""
echo "📖 See DEPLOYMENT.md for detailed configuration instructions"
