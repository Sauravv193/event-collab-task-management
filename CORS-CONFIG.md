# CORS Configuration Guide

## Current Issue
The backend CORS configuration is blocking requests from your deployed frontend.

## Backend CORS Configuration (Render)

### Current Configuration:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://vercel.app
```

### Recommended Configuration:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://*.vercel.app,https://your-actual-frontend-url.vercel.app
```

## How to Update CORS on Render:

1. **Log into Render Dashboard**
   - Go to https://render.com/dashboard
   - Find your backend service

2. **Update Environment Variables**
   - Go to your backend service
   - Click on "Environment" tab
   - Find `CORS_ALLOWED_ORIGINS` variable
   - Update with the new value including your frontend URL

3. **Common Frontend URLs to Include:**
   ```
   # Local development
   http://localhost:5173
   http://localhost:3000
   
   # Vercel deployment patterns
   https://*.vercel.app
   https://your-app-name.vercel.app
   https://your-app-name-git-main-username.vercel.app
   https://your-app-name-username.vercel.app
   
   # Production domain (if you have one)
   https://yourdomain.com
   ```

## Testing CORS:

### Method 1: Browser Developer Tools
1. Open your frontend in browser
2. Open Developer Tools (F12)
3. Go to Console
4. Look for CORS errors like:
   ```
   Access to fetch at 'https://backend-url/api/v1/events' from origin 'https://frontend-url' 
   has been blocked by CORS policy
   ```

### Method 2: Using our test script
```bash
node test-connection.js
```

### Method 3: Direct curl test
```bash
curl -H "Origin: https://your-frontend-url.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://event-collab-task-management-2.onrender.com/api/v1/events
```

## Troubleshooting:

1. **Still getting CORS errors?**
   - Make sure you deployed the changes to Render
   - Check the exact URL of your frontend (copy from browser)
   - Ensure no typos in the CORS configuration

2. **Backend not responding?**
   - Check Render logs for your backend service
   - Verify backend is not sleeping (free tier)

3. **500 errors?**
   - Check database connection
   - Verify environment variables are set correctly