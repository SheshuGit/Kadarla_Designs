# Deployment Guide

## Environment Variables Setup

### For Frontend (Render/Vercel/Netlify)

Set the following environment variable in your hosting platform:

**Variable Name:** `VITE_API_URL`

**Value Options:**
- For Render backend: `https://kadarla-designs.onrender.com/api`
- For local development: `http://localhost:5000/api` (or leave unset to use default)

**Note:** The code automatically appends `/api` if missing, so you can also set it to:
- `https://kadarla-designs.onrender.com` (without `/api` - will be auto-added)

### For Backend (Render)

Set the following environment variables in your Render backend service:

1. **MONGODB_URI** - Your MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/`

2. **DBName** - Your database name
   - Example: `kadarladesigns`

3. **PORT** - Server port (optional, defaults to 5000)
   - Example: `5000`

4. **JWT_SECRET** - Secret key for JWT tokens (optional, but recommended)
   - Generate a random string for production

## Render Setup Instructions

### Frontend Deployment

1. Connect your GitHub repository to Render
2. Create a new **Static Site** service
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-service.onrender.com/api`

### Backend Deployment

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm run server`
5. Add environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `DBName` - Your database name
   - `PORT` - Port number (optional)

## MongoDB Atlas IP Whitelist

Make sure to whitelist Render's IP addresses in MongoDB Atlas:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. For Render, you can add: `0.0.0.0/0` (allows all IPs - for development)
   - Or add specific Render IP ranges if available

## Troubleshooting

### 404 Errors on API Calls

If you see 404 errors, check:
1. `VITE_API_URL` is set correctly in your frontend environment
2. The URL includes `/api` at the end (or the code will auto-add it)
3. Your backend service is running and accessible

### CORS Errors

If you see CORS errors, ensure your backend has CORS enabled (already configured in `server/index.js`).

### MongoDB Connection Errors

1. Check MongoDB Atlas IP whitelist
2. Verify `MONGODB_URI` is correct
3. Check database name matches `DBName` environment variable

