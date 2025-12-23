# Deployment Guide

## Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

## Option 2: Netlify
1. `npm run build`
2. Drag `dist` folder to Netlify
3. Configure redirects for SPA

## Option 3: Self-hosted
1. `npm run build`
2. Serve `dist` folder with any static server
3. Ensure HTTPS for PWA features

## Post-Deployment
1. Test PWA installation
2. Verify offline functionality
3. Check all features work
4. Monitor analytics/errors