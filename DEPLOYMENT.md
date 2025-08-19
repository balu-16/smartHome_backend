# Backend Deployment Guide for Vercel

This guide explains how to deploy the backend to Vercel.

## Prerequisites

1. Vercel account
2. GitHub repository with your code
3. Environment variables configured

## Environment Variables

Set the following environment variables in your Vercel dashboard:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
NODE_ENV=production
SMS_SECRET=your_sms_secret
SMS_SENDER=your_sms_sender
SMS_TEMPID=your_sms_template_id
SMS_ROUTE=your_sms_route
SMS_MSGTYPE=your_sms_message_type
SMS_BASE_URL=your_sms_base_url
```

**Important**: Never commit your `.env` file to version control. The `.vercelignore` file is configured to exclude it.

## Deployment Steps

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `backend` folder as the root directory

3. **Configure Build Settings**:
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: `npm run vercel-build`
   - Output Directory: (leave empty)
   - Install Command: `npm install`

4. **Set Environment Variables**:
   - Go to Project Settings > Environment Variables
   - Add all the required environment variables listed above

5. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically deploy your backend as serverless functions

## API Endpoints

After deployment, your API will be available at:
- `https://your-project.vercel.app/health` - Health check
- `https://your-project.vercel.app/v1/auth/*` - Authentication endpoints
- `https://your-project.vercel.app/v1/gps-signal/*` - GPS/Device endpoints
- `https://your-project.vercel.app/v1/sms/send` - SMS endpoint

## Local Development

For local development, the server will still run normally:

```bash
npm run dev
```

The app will automatically detect if it's running in production (Vercel) or development mode.

## Troubleshooting

1. **Build Errors**: Check the build logs in Vercel dashboard
2. **Environment Variables**: Ensure all required env vars are set
3. **Database Connection**: Verify Supabase credentials are correct
4. **Function Timeout**: Functions have a 30-second timeout limit

## Pre-Deployment Checklist

✅ **Configuration Files**:
- `vercel.json` - Vercel configuration with proper routing
- `.vercelignore` - Excludes sensitive and unnecessary files
- `package.json` - Updated with correct main entry point and scripts

✅ **Code Structure**:
- `index.js` - Exports Express app for serverless deployment
- All imports use `.js` extensions for ES modules
- Environment variables properly referenced

✅ **Dependencies**:
- All required packages listed in `package.json`
- `node-fetch` added for HTTP requests
- No missing dependencies

✅ **Security**:
- `.env` file excluded from deployment
- Sensitive data will be set via Vercel dashboard
- No hardcoded secrets in code

## Files Added/Modified for Vercel Deployment

- `vercel.json` - Vercel configuration
- `.vercelignore` - Files to exclude from deployment
- Modified `index.js` - Export app for serverless deployment
- Updated `package.json` - Vercel-compatible scripts and main entry point