# Smart Link Hub - Complete Deployment Guide

**Comprehensive, step-by-step guide to deploy your entire application with exact commands and screenshots reference.**

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Choose Your Deployment Platform](#choose-your-deployment-platform)
3. [Option 1: Render + Vercel (Recommended for Beginners)](#option-1-render--vercel-recommended)
4. [Option 2: AWS EC2 (Full Control)](#option-2-aws-ec2-full-control)
5. [Option 3: Railway (Simplest Alternative)](#option-3-railway-simplest-alternative)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## Pre-Deployment Checklist

Before starting deployment, complete these steps:

### Step 1: Verify Local Application Works

```powershell
# Terminal 1: Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

```powershell
# Terminal 2: Frontend
cd frontend
npm install
npm run dev -- -p 3001
```

**Expected Output:**
```
▲ Next.js 14.x.x
- Local: http://localhost:3001
```

✅ **Test**: Open http://localhost:3001 in browser. You should see the dark-themed login page.

### Step 2: Generate Secret Key

```powershell
# Generate a secure SECRET_KEY for production
python -c "import secrets; print(secrets.token_hex(32))"
```

**Output**: Save this 64-character string. You'll need it for production environment variables.

### Step 3: Update GitHub Repository

```powershell
# Make sure all changes are committed
cd smart-link-hub
git status

# If there are changes:
git add .
git commit -m "pre-deployment: finalize code"
git push origin main
```

### Step 4: Create Environment Files

#### Backend `.env.example` → `.env.production`

Update `backend/.env`:
```env
# Database (will be provided by deployment platform)
DATABASE_URL=postgresql://user:password@hostname:5432/smart_link_hub

# Security
SECRET_KEY=YOUR_GENERATED_SECRET_KEY_HERE
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server
DEBUG=False
ENVIRONMENT=production

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://frontend-url.vercel.app

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
```

#### Frontend `.env.local` → `.env.production`

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_APP_NAME=Smart Link Hub
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_QR_DOWNLOAD=true
```

---

## Choose Your Deployment Platform

### Quick Comparison

| Platform | Backend | Frontend | Database | Cost | Difficulty | Best For |
|----------|---------|----------|----------|------|------------|----------|
| **Render + Vercel** | ✅ | ✅ | ✅ | $0-34/mo | ⭐ Easy | Small-medium projects |
| **AWS EC2** | ✅ | ✅ | ✅ | $5-50/mo | ⭐⭐⭐ Hard | Full control |
| **Railway** | ✅ | ✅ | ✅ | $0-50/mo | ⭐⭐ Medium | Quick setup |
| **Heroku** | ✅ | ✅ | ✅ | $7-50/mo | ⭐ Easy | Legacy (expensive) |
| **Fly.io** | ✅ | ✅ | ✅ | $3-50/mo | ⭐⭐ Medium | Global scaling |

**Recommended for you: Render + Vercel** (easiest, free tier available, good support)

---

## Option 1: Render + Vercel (Recommended)

### A. Deploy Database on Render

**Step 1: Create Render Account**
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your GitHub account

**Step 2: Create PostgreSQL Database**
1. Dashboard → Click "New +"
2. Select "PostgreSQL"
3. Fill details:
   - **Name**: `smart-link-hub-db`
   - **Database**: `smart_link_hub`
   - **User**: `postgres`
   - **Password**: Generate strong password (copy it!)
   - **Region**: Select closest to you
   - **Plan**: Free (for testing)
4. Click "Create Database"
5. Wait 1-2 minutes for database to be ready
6. Once ready, you'll see:
   - **Internal Database URL**: `postgres://postgres:PASSWORD@dpg-xxx.render.internal:5432/smart_link_hub`
   - **External Database URL**: `postgres://user:password@dpg-xxx.onrender.com:5432/smart_link_hub`
7. **COPY and SAVE the Internal Database URL** (you'll need it for backend)

### B. Deploy Backend on Render

**Step 1: Create Web Service**
1. Dashboard → "New +" → "Web Service"
2. Select "Deploy an existing repository"
3. Search for your repo: `Mustaqeemuddin7/smart-link-hub`
4. Click "Connect"

**Step 2: Configure Backend Service**
Fill in the form:
- **Name**: `smart-link-hub-backend`
- **Environment**: `Python 3.11`
- **Branch**: `main`
- **Build Command**:
  ```
  pip install -r requirements.txt && alembic upgrade head
  ```
- **Start Command**:
  ```
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- **Root Directory**: `backend` (important!)

**Step 3: Add Environment Variables**
Click "Advanced" → "Environment"

Add each variable (copy-paste these):
```
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@dpg-xxx.render.internal:5432/smart_link_hub
SECRET_KEY=YOUR_SECRET_KEY_FROM_STEP_2
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
ALLOWED_ORIGINS=https://smart-link-hub-frontend.onrender.com
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
```

**Step 4: Select Plan and Deploy**
- Plan: Select "Free" for testing
- Click "Create Web Service"
- Wait 3-5 minutes
- You'll see "Live" with a green dot when ready
- **Note your Backend URL**: `https://smart-link-hub-backend.onrender.com`

**Test Backend**:
```powershell
# In PowerShell, test the endpoint
Invoke-WebRequest "https://smart-link-hub-backend.onrender.com/docs"
```

### C. Deploy Frontend on Vercel

**Step 1: Create Vercel Account**
1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Authorize Vercel

**Step 2: Import Project**
1. Click "Select a Git Repository"
2. Search: `smart-link-hub`
3. Click "Import"

**Step 3: Configure Project**
- **Project Name**: `smart-link-hub`
- **Root Directory**: `frontend` (dropdown)
- **Framework**: Next.js (auto-detected)
- **Build & Output Settings**: (leave defaults)

**Step 4: Add Environment Variables**
Click "Environment Variables" and add:
```
NEXT_PUBLIC_API_URL=https://smart-link-hub-backend.onrender.com/api
NEXT_PUBLIC_APP_NAME=Smart Link Hub
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_QR_DOWNLOAD=true
```

**Step 5: Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- You'll get **Frontend URL**: `https://smart-link-hub.vercel.app`

**Test Frontend**:
Open `https://smart-link-hub.vercel.app` in browser. You should see the login page.

### D. Connect Custom Domain (Optional)

**For Frontend (Vercel)**:
1. Project Settings → "Domains"
2. Enter your domain: `yourdomain.com`
3. Add DNS records at your registrar:
   ```
   yourdomain.com  A  76.76.19.21
   ```
4. Wait 24-48 hours for DNS propagation

**For Backend (Render)**:
1. Backend Service → Settings → "Custom Domain"
2. Enter: `api.yourdomain.com`
3. Add DNS records:
   ```
   api.yourdomain.com  CNAME  smart-link-hub-backend.onrender.com
   ```

---

## Option 2: AWS EC2 (Full Control)

### A. Launch EC2 Instance

**Step 1: Create AWS Account**
1. Go to https://aws.amazon.com
2. Sign up for free tier account
3. Verify email and phone

**Step 2: Launch Instance**
1. AWS Console → EC2 → "Launch Instance"
2. Select "Ubuntu Server 22.04 LTS" (free tier eligible)
3. Instance Type: `t2.micro` (free tier)
4. **Key Pair**: Create new → Name: `smart-link-hub-key` → Download `.pem` file
5. Security Group: Create new → Allow:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
6. Storage: 30 GB (free tier)
7. Click "Launch Instance"

**Step 3: Connect to Instance**
```powershell
# Change directory to where you saved the .pem file
cd C:\Users\YourUsername\Downloads

# Connect via SSH
ssh -i smart-link-hub-key.pem ubuntu@your-instance-public-ip
```

### B. Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose git

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Verify Docker
docker --version
docker-compose --version
```

### C. Clone and Deploy Application

```bash
# Clone repository
git clone https://github.com/Mustaqeemuddin7/smart-link-hub.git
cd smart-link-hub

# Create environment files
nano .env.production
# (Paste your environment variables)
# Press Ctrl+X, Y, Enter to save

# Build and start with Docker Compose
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f
```

### D. Configure Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create config file
sudo nano /etc/nginx/sites-available/smart-link-hub
```

Paste this configuration:
```nginx
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart:
```bash
# Enable config
sudo ln -s /etc/nginx/sites-available/smart-link-hub /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### E. Setup SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Update Nginx config for HTTPS (we'll update the config file)
```

Update Nginx config with SSL:
```bash
sudo nano /etc/nginx/sites-available/smart-link-hub
```

Replace with:
```nginx
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
```

Restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Option 3: Railway (Simplest Alternative)

### A. Setup Railway Project

**Step 1: Create Account**
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway

**Step 2: Create Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repo: `smart-link-hub`

**Step 3: Add Services**

**For PostgreSQL Database**:
1. Click "Add Service" → "PostgreSQL"
2. Railway creates database automatically
3. Note the connection URL

**For Backend**:
1. Click "Add Service" → "GitHub Repo"
2. Select the repo again
3. Set Build & Deploy:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**For Frontend**:
1. Click "Add Service" → "GitHub Repo"
2. Select the repo
3. Set Build & Deploy:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

**Step 4: Set Environment Variables**
1. Select each service
2. Click "Variables"
3. Add the environment variables for each service

**Step 5: Deploy**
- Railway automatically deploys
- You'll get URLs for each service
- Click on the service to view logs

---

## Post-Deployment Verification

### Test Backend API

```powershell
# Replace with your actual backend URL
$backendURL = "https://your-backend-url.com"

# Check health
Invoke-WebRequest "$backendURL/health"

# Check API docs
Invoke-WebRequest "$backendURL/docs"

# Test login endpoint
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest "$backendURL/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

### Test Frontend

1. Open frontend URL in browser: `https://smart-link-hub.vercel.app`
2. You should see the login page
3. Try logging in (or create account)
4. Check if you can access dashboard
5. Try creating a hub and adding links

### Test Database

```bash
# If deployed on Render, use their interface
# If deployed on AWS, SSH in and:
docker exec smart-link-hub-postgres psql -U postgres -d smart_link_hub -c "SELECT * FROM users;"
```

### Monitor Logs

**Render**:
- Backend Service → "Logs"
- Frontend Service → "Logs"
- Database → "Logs"

**Vercel**:
- Project → "Deployments"
- Click latest deployment → "View Logs"

**AWS EC2**:
```bash
# SSH into instance
ssh -i smart-link-hub-key.pem ubuntu@your-ip

# View Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

## Common Issues & Solutions

### Issue 1: CORS Error When Frontend Calls Backend

**Error**: 
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution**:
1. Go to backend service environment variables
2. Update `ALLOWED_ORIGINS` to include your frontend URL:
   ```
   ALLOWED_ORIGINS=https://smart-link-hub.vercel.app,https://yourdomain.com
   ```
3. Redeploy backend
4. Clear browser cache (Ctrl+Shift+Delete)
5. Refresh (F5)

### Issue 2: Database Connection Timeout

**Error**:
```
could not connect to server: Connection timed out
```

**Solution**:
1. Verify DATABASE_URL is correct
2. Render: Check that internal database URL is used for backend on same platform
3. Wait for database to be in "available" state
4. Check firewall/security groups allow database connection

### Issue 3: 502 Bad Gateway / Service Unavailable

**Error**:
```
502 Bad Gateway / Service Unavailable
```

**Render/Vercel**:
1. Check service status in dashboard (green = running)
2. View logs for error messages
3. Restart service

**AWS**:
```bash
# SSH and check status
docker-compose ps

# Restart service
docker-compose restart

# Check logs
docker-compose logs -f
```

### Issue 4: Frontend Environment Variables Not Loading

**Error**:
```
NEXT_PUBLIC_API_URL is undefined
```

**Solution**:
1. Verify variables start with `NEXT_PUBLIC_`
2. Vercel: Go to Project Settings → Environment Variables
3. Delete all old deployments
4. Make a new commit: `git commit --allow-empty -m "rebuild"`
5. Push to trigger new deployment: `git push origin main`
6. Wait for build to complete
7. Clear browser cache and hard refresh (Ctrl+Shift+F5)

### Issue 5: Database Migrations Failed

**Error**:
```
alembic upgrade head failed
```

**Solution**:
```bash
# SSH into your instance or container
# Check current migration
alembic current

# Show migration history
alembic history

# Downgrade if needed
alembic downgrade -1

# Re-run upgrade
alembic upgrade head
```

### Issue 6: Port Already in Use

**Local Development**:
```powershell
# Find process using port
netstat -ano | findstr :8000

# Kill it
taskkill /PID <PID> /F
```

**Docker**:
```bash
# Port conflict in docker-compose
docker-compose down -v
docker-compose up -d
```

### Issue 7: Files Deleted But Still Errors

**Error**: `"Module ThemeContext not found"` (after deletion)

**Solution**:
```bash
# Clear build cache
# Render: Redeploy manually from dashboard
# Vercel: Delete all deployments, commit new change
git commit --allow-empty -m "clear cache"
git push origin main

# Local: Clear build
cd frontend && rm -r .next
npm run build
```

---

## Deployment Checklist - Final

### Before Deployment
- [ ] Tested application locally (npm run dev + backend running)
- [ ] All code committed and pushed to GitHub
- [ ] Generated secure SECRET_KEY
- [ ] Updated environment variables
- [ ] Database URL prepared

### During Deployment (Render + Vercel)
- [ ] Created Render account
- [ ] Created PostgreSQL database on Render
- [ ] Deployed backend on Render
- [ ] Added environment variables to backend
- [ ] Created Vercel account
- [ ] Deployed frontend on Vercel
- [ ] Added environment variables to frontend
- [ ] Updated CORS settings on backend

### After Deployment
- [ ] Accessed frontend URL in browser
- [ ] Tested login/signup flow
- [ ] Created test hub and links
- [ ] Verified backend API docs accessible
- [ ] Checked logs for errors
- [ ] Monitored first few hours of operation
- [ ] Set up monitoring/alerts (optional)
- [ ] Configured custom domain (optional)
- [ ] Set up backups (optional)

### Post-Launch
- [ ] Shared application URL with users
- [ ] Monitor error logs daily
- [ ] Keep dependencies updated
- [ ] Regular database backups
- [ ] Monitor performance metrics

---

## Success Indicators

✅ **Deployment is successful when**:
1. Frontend loads at frontend URL
2. Login page displays correctly
3. Can create account and log in
4. Can create hubs
5. Can add links to hubs
6. Can view analytics (if enabled)
7. Backend API docs accessible at `/docs`
8. No CORS errors in browser console
9. No 502/503 errors
10. Logs show no critical errors

---

## Next Steps After Deployment

### 1. Setup Custom Domain (Optional)
```
yourdomain.com → Frontend (Vercel)
api.yourdomain.com → Backend (Render)
```

### 2. Setup Monitoring
- Render: Settings → Alerts
- Vercel: Project → Analytics
- Email notifications for failures

### 3. Setup Backups
```bash
# Daily backup script
0 2 * * * pg_dump smart_link_hub | gzip > /backups/backup-$(date +\%Y\%m\%d).sql.gz
```

### 4. Enable SSL
- Render: Automatic (free)
- Vercel: Automatic (free)
- AWS: Use Let's Encrypt (free)

### 5. Monitor Performance
- Check response times
- Monitor error rates
- Review analytics
- Optimize queries if needed

---

## Getting Help

### Documentation Links
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **AWS Docs**: https://docs.aws.amazon.com/ec2
- **Railway Docs**: https://docs.railway.app

### Community Support
- **GitHub Issues**: https://github.com/Mustaqeemuddin7/smart-link-hub/issues
- **Render Support**: https://render.com/support
- **Vercel Support**: https://vercel.com/support

---

**Last Updated**: January 2026

**Ready to Deploy?** Start with [Option 1: Render + Vercel](#option-1-render--vercel-recommended) if you're unsure!
