# 🚀 Deployment Guide - AlgoRiddle

This guide will help you deploy AlgoRiddle for FREE using Render (backend) and Vercel (frontend).

## 📋 Prerequisites

- GitHub account (you already have this)
- MongoDB Atlas account (free tier)
- Render account (free tier)
- Vercel account (free tier)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster:
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select a cloud provider and region (choose closest to you)
   - Click "Create Cluster"

4. Create a database user:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `algoriddle`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

5. Whitelist all IP addresses (for Render to connect):
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. Get your connection string:
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://algoriddle:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name at the end: `mongodb+srv://algoriddle:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/algoriddle?retryWrites=true&w=majority`
   - Save this connection string!

---

## 🖥️ Step 2: Deploy Backend on Render

1. Go to [Render](https://render.com/) and sign up with GitHub

2. Click "New +" → "Web Service"

3. Connect your GitHub repository:
   - Click "Connect account" if needed
   - Find and select `college_project` repository
   - Click "Connect"

4. Configure the web service:
   - **Name**: `algoriddle-backend` (or any name you like)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_connection_string_from_step_1
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
   
   **Note**: 
   - You'll update `FRONTEND_URL` after deploying frontend in Step 3
   - `NODE_ENV=production` enables the self-ping feature to keep the server awake

6. Click "Create Web Service"

7. Wait for deployment (5-10 minutes). Once done, you'll see:
   - Status: "Live"
   - Your backend URL: `https://algoriddle-backend.onrender.com` (copy this!)

8. **Self-Ping Feature**: The backend now includes an automatic self-ping mechanism that:
   - Pings itself every 10 minutes
   - Prevents Render from spinning down due to inactivity
   - Keeps your app responsive 24/7
   - Check logs to see: `[Self-Ping] ✓ Keep-alive ping successful`

9. **IMPORTANT**: Even with self-ping, Render free tier has limitations:
   - 750 hours/month (enough for 1 service running 24/7)
   - First request after deployment restart takes 30-60 seconds

9. Seed the database (optional but recommended):
   - Go to your Render dashboard
   - Click on your service
   - Go to "Shell" tab
   - Run: `node seed.js`
   - This will populate your database with sample DSA questions

---

## 🌐 Step 3: Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com/) and sign up with GitHub

2. Click "Add New..." → "Project"

3. Import your repository:
   - Find `college_project` repository
   - Click "Import"

4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add:
     ```
     VITE_BACKEND_URL=https://algoriddle-backend.onrender.com
     ```
   - Replace with YOUR actual Render backend URL from Step 2

6. Click "Deploy"

7. Wait for deployment (2-3 minutes). Once done, you'll get:
   - Your frontend URL: `https://college-project-xxx.vercel.app`

8. **Update Backend Environment Variable**:
   - Go back to Render dashboard
   - Click on your backend service
   - Go to "Environment" tab
   - Update `FRONTEND_URL` with your Vercel URL
   - Click "Save Changes"
   - Service will automatically redeploy

---

## ✅ Step 4: Test Your Deployment

1. Open your Vercel URL in browser
2. Click "Start Practice Session"
3. Enter your name and select a topic
4. You should see the room with code editor, whiteboard, and voice chat
5. Share the room URL with a friend to test collaboration

**Common Issues:**

- **"Failed to load room"**: Backend is waking up from sleep (wait 30-60 seconds and refresh)
- **Socket connection errors**: Check if `FRONTEND_URL` in Render matches your Vercel URL exactly
- **Voice not working**: WebRTC requires HTTPS (both Render and Vercel provide this automatically)

---

## 🔄 Step 5: Automatic Deployments

Both Render and Vercel are now connected to your GitHub repository:

- **Push to GitHub** → Automatic deployment on both platforms
- **Frontend**: Deploys in ~2 minutes
- **Backend**: Deploys in ~5 minutes

To push updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

---

## 📊 Monitoring & Logs

### Render (Backend):
- Dashboard → Your Service → "Logs" tab
- See real-time server logs
- Check for errors

### Vercel (Frontend):
- Dashboard → Your Project → "Deployments"
- Click on a deployment → "View Function Logs"
- See build and runtime logs

---

## 💰 Free Tier Limits

### Render Free Tier:
- ✅ 750 hours/month (enough for 1 service running 24/7)
- ✅ Automatic HTTPS
- ✅ Self-ping keeps server awake
- ⚠️ Resets monthly (server restarts on 1st of each month)

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ No cold starts

### MongoDB Atlas Free Tier:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ No credit card required

---

## 🔧 Troubleshooting

### Backend won't start:
1. Check Render logs for errors
2. Verify `MONGO_URI` is correct
3. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Frontend can't connect to backend:
1. Check browser console for errors
2. Verify `VITE_BACKEND_URL` in Vercel matches Render URL
3. Verify `FRONTEND_URL` in Render matches Vercel URL
4. Check CORS settings in `server/index.js`

### Voice chat not working:
1. Ensure both URLs use HTTPS (they should by default)
2. Check browser microphone permissions
3. Test on Chrome (best WebRTC support)
4. Check browser console for WebRTC errors

### Whiteboard not syncing:
1. Check Socket.IO connection in browser console
2. Verify both users are in the same room
3. Check Render logs for socket errors

---

## 🎯 Production Checklist

Before sharing with others:

- [ ] MongoDB Atlas cluster is running
- [ ] Backend is deployed on Render and showing "Live"
- [ ] Frontend is deployed on Vercel
- [ ] Environment variables are set correctly on both platforms
- [ ] Database is seeded with questions (`node seed.js` in Render shell)
- [ ] Test creating a room and joining from 2 different browsers
- [ ] Test code editor sync
- [ ] Test whiteboard sync
- [ ] Test voice chat (if microphone is working)
- [ ] Share room URL and verify others can join

---

## 🚀 Your Live URLs

After deployment, save these:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://algoriddle-backend.onrender.com`
- **MongoDB**: `mongodb+srv://...` (keep this secret!)

---

## 📝 Notes

1. **First Load**: Backend takes 30-60 seconds to wake up on first request after inactivity
2. **Custom Domain**: Both Render and Vercel support custom domains (requires domain purchase)
3. **Scaling**: If you need better performance, upgrade to paid tiers ($7/month Render, $20/month Vercel)
4. **Backups**: MongoDB Atlas free tier includes automated backups

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/

---

## 🎉 Congratulations!

Your AlgoRiddle platform is now live and accessible to anyone with the URL!

Share it with your friends and start collaborating on DSA problems together! 🚀
