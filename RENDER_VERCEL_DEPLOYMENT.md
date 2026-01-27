# Smart Link Hub - Render & Vercel Deployment Guide

Complete step-by-step guide to deploy Smart Link Hub on Render and Vercel platforms.

## Table of Contents

- [Render Deployment](#render-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Domain Configuration](#domain-configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Render Deployment

Render is a unified platform to build and run all your apps and websites with free SSL, a global CDN, and auto-deploys from Git.

### Prerequisites

- Render account (https://render.com) - free tier available
- GitHub repository connected
- PostgreSQL database (Render provides this)

### Part 1: Deploy PostgreSQL Database

1. **Log in to Render Dashboard**
   - Go to https://dashboard.render.com
   - Click "New" → "PostgreSQL"

2. **Configure Database**
   - **Name**: `smart-link-hub-db`
   - **Database**: `smart_link_hub`
   - **User**: `postgres` (default)
   - **Region**: Choose closest to your users
   - **Plan**: Free (0.25 GB RAM, 1 GB storage) or Starter+

3. **Create Database**
   - Click "Create Database"
   - Wait for database to be provisioned (~1-2 minutes)
   - Copy the **Internal Database URL** for later
   - External URL format: `postgresql://user:password@host:5432/smart_link_hub`

### Part 2: Deploy Backend on Render

1. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Select "Deploy an existing repository"
   - Search and connect your GitHub repo: `Mustaqeemuddin7/smart-link-hub`
   - Click "Connect"

2. **Configure Backend Service**
   - **Name**: `smart-link-hub-backend`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3.11`
   - **Build Command**: 
     ```
     pip install -r requirements.txt && alembic upgrade head
     ```
   - **Start Command**: 
     ```
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

3. **Environment Variables**
   - Click "Advanced" → "Environment"
   - Add the following variables:

   ```
   DATABASE_URL=postgresql://user:password@hostname:5432/smart_link_hub
   SECRET_KEY=your-super-secret-key-change-this
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEBUG=False
   ALLOWED_ORIGINS=https://yourdomain.com,https://frontend-service-name.onrender.com
   RATE_LIMIT_REQUESTS=100
   RATE_LIMIT_PERIOD=60
   ```

4. **Select Plan & Deploy**
   - **Plan**: Free ($0/month) or Starter+ ($7/month)
   - Click "Create Web Service"
   - Render will deploy automatically
   - Wait for green "Live" status (~3-5 minutes)

5. **Verify Deployment**
   - Backend URL: `https://smart-link-hub-backend.onrender.com`
   - API Docs: `https://smart-link-hub-backend.onrender.com/docs`

### Part 3: Deploy Frontend on Render

1. **Create Web Service for Frontend**
   - Dashboard → "New" → "Web Service"
   - Connect same GitHub repository
   - Click "Connect"

2. **Configure Frontend Service**
   - **Name**: `smart-link-hub-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```

3. **Environment Variables**
   - Click "Advanced" → "Environment"
   - Add variables:

   ```
   NEXT_PUBLIC_API_URL=https://smart-link-hub-backend.onrender.com/api
   NEXT_PUBLIC_APP_NAME=Smart Link Hub
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   NEXT_PUBLIC_ENABLE_QR_DOWNLOAD=true
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Frontend URL: `https://smart-link-hub-frontend.onrender.com`

### Part 4: Connect Custom Domain (Render)

1. **Get Custom Domain**
   - Purchase domain from GoDaddy, Namecheap, or any registrar
   - Or use free domain from Freenom

2. **Update Frontend Service**
   - Go to `smart-link-hub-frontend` service
   - Settings → "Custom Domain"
   - Enter your domain (e.g., `yourdomain.com`)
   - Note the CNAME value provided

3. **Update DNS Records**
   - Go to your domain registrar's DNS settings
   - Add CNAME record:
     ```
     Host: @
     Points to: smart-link-hub-frontend.onrender.com
     TTL: 300
     ```
   - Wait for DNS propagation (5-48 hours)

4. **Update CORS Settings**
   - Backend service settings
   - Update ALLOWED_ORIGINS in Environment Variables:
     ```
     ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
     ```

### Part 5: Enable Auto-Deploy (Render)

1. Go to service settings → "Deploy"
2. Check "Auto-deploy on new commits to main"
3. Now any git push to main branch triggers automatic deployment

### Render Free Plan Limitations

- Database spins down after 15 minutes of inactivity
- Backend spins down after 15 minutes of inactivity
- ~0.5GB RAM, 1GB storage
- Best for: Development, testing, demos
- **Upgrade to Starter+ for production** ($7/month per service)

---

## Vercel Deployment

Vercel is the frontend deployment platform by the creators of Next.js. Perfect for hosting the frontend.

### Prerequisites

- Vercel account (https://vercel.com) - free tier available
- GitHub repository connected
- Backend deployed elsewhere (Render, Railway, Fly.io, etc.)

### Part 1: Prepare Backend

Before deploying frontend to Vercel, ensure backend is accessible:

**Option A: Use Render Backend** (from above)
- Backend URL: `https://smart-link-hub-backend.onrender.com/api`

**Option B: Use Heroku**
```bash
heroku create smart-link-hub-backend
git push heroku main
```

**Option C: Use Railway**
- Go to railway.app
- New Project → GitHub Repo
- Set environment variables
- Deploy

### Part 2: Deploy Frontend to Vercel

1. **Connect GitHub Repository**
   - Go to https://vercel.com/new
   - Click "Continue with GitHub"
   - Authorize Vercel
   - Select repository: `smart-link-hub`
   - Click "Import"

2. **Configure Frontend Project**
   - **Project Name**: `smart-link-hub`
   - **Root Directory**: `frontend`
   - **Framework**: `Next.js`
   - **Build & Output Settings** (auto-detected):
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

3. **Environment Variables**
   - Add production environment variables:

   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   NEXT_PUBLIC_APP_NAME=Smart Link Hub
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   NEXT_PUBLIC_ENABLE_QR_DOWNLOAD=true
   ```

   **For preview deployments** (separate section):
   ```
   NEXT_PUBLIC_API_URL=https://dev-backend-url.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Deployment completes in ~2-3 minutes
   - URL: `https://smart-link-hub.vercel.app`

### Part 3: Connect Custom Domain (Vercel)

1. **Add Custom Domain**
   - Project Settings → "Domains"
   - Enter domain (e.g., `yourdomain.com`)
   - Click "Add"

2. **Configure DNS**
   - Vercel provides DNS settings
   - **Option A: Use Vercel Nameservers** (recommended)
     - Update domain registrar to use Vercel's nameservers
     - Takes 24-48 hours to propagate
   
   - **Option B: Add CNAME Record**
     - Add CNAME at registrar:
       ```
       CNAME: www.yourdomain.com → cname.vercel-dns.com
       A Record: yourdomain.com → 76.76.19.21 (Vercel IP)
       ```

3. **Enable SSL/TLS**
   - Vercel automatically provisions SSL certificate
   - Takes ~30 seconds after DNS propagates
   - All traffic redirected to HTTPS automatically

### Part 4: Enable Auto-Deploy (Vercel)

1. **Git Integration** (automatic)
   - Every push to `main` branch triggers deployment
   - Preview deployments for pull requests
   - View deployment logs in dashboard

2. **Deployment Settings**
   - Project Settings → "Git"
   - Production Branch: `main`
   - Preview Deployments: `All pull requests`

3. **Automatic Rollback**
   - Project Settings → "Deployments"
   - Manually rollback to previous version if needed

### Vercel Free Plan Features

- Unlimited deployments
- Free SSL certificate
- Global CDN
- Automatic image optimization
- Edge caching
- Environment variables support
- **Perfect for production**

---

## Environment Variables

### Backend Environment Variables (Render)

```env
# Database
DATABASE_URL=postgresql://user:password@hostname:5432/smart_link_hub

# Security
SECRET_KEY=generate-with-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Deployment
DEBUG=False
ENVIRONMENT=production

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://smart-link-hub-frontend.onrender.com

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60

# Optional
REDIS_URL=redis://localhost:6379/0
SENTRY_DSN=https://your-sentry-dsn
```

### Frontend Environment Variables (Vercel)

```env
# Production
NEXT_PUBLIC_API_URL=https://your-backend-url/api
NEXT_PUBLIC_APP_NAME=Smart Link Hub
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_QR_DOWNLOAD=true

# Optional
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

### How to Generate SECRET_KEY

```bash
# On Linux/macOS
openssl rand -hex 32

# On Windows PowerShell
[Convert]::ToHexString((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))

# Or using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Domain Configuration

### Setup yourdomain.com (Both Services)

#### Option 1: Separate Domains
- **Frontend**: `https://app.yourdomain.com` → Vercel
- **Backend**: `https://api.yourdomain.com` → Render

DNS Records:
```
app.yourdomain.com    CNAME    smart-link-hub.vercel.app
api.yourdomain.com    CNAME    smart-link-hub-backend.onrender.com
```

Backend CORS update:
```
ALLOWED_ORIGINS=https://app.yourdomain.com
```

#### Option 2: Same Domain with Path Routing
- **Frontend**: `https://yourdomain.com` → Vercel
- **Backend**: `https://yourdomain.com/api` → Proxy via Vercel

Add rewrite in `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api-backend.onrender.com/api/:path*"
    }
  ]
}
```

Frontend environment variable:
```
NEXT_PUBLIC_API_URL=/api
```

### SSL Certificate

- **Vercel**: Automatic free SSL certificate
- **Render**: Automatic free SSL certificate
- No additional configuration needed

---

## Monitoring

### Render Monitoring

1. **Dashboard Overview**
   - Service status (Running, Suspended, Failed)
   - Last deploy time and logs
   - CPU and memory usage

2. **View Logs**
   - Service → "Logs"
   - Real-time log streaming
   - Filter by date/time

3. **Deployment History**
   - Service → "Deployments"
   - View each deployment status
   - Rollback to previous version

4. **Set Up Alerts**
   - Settings → "Alerts"
   - Email notifications for deployment failures
   - Monitor service health

### Vercel Monitoring

1. **Deployment Dashboard**
   - View all deployments with status
   - Deployment time and size
   - Environment details

2. **View Logs**
   - Deployments → Select deployment → "Logs"
   - Real-time build logs
   - Runtime logs for edge functions

3. **Analytics**
   - Project → "Analytics"
   - Web Vitals (LCP, FID, CLS)
   - Performance metrics

4. **Error Tracking**
   - Project → "Monitoring"
   - Application errors and warnings
   - Source map integration for debugging

### Health Checks

```bash
# Check backend health
curl https://smart-link-hub-backend.onrender.com/health

# Check frontend
curl https://yourdomain.com

# Check API docs
curl https://smart-link-hub-backend.onrender.com/docs
```

---

## Troubleshooting

### Render Issues

#### 1. Database Connection Timeout
```
Error: could not translate host name "postgres" to address
```
**Solution**:
- Verify DATABASE_URL is correct
- Check database is in "available" state
- Whitelist Render IPs in database settings

#### 2. Build Fails - Dependency Error
```
ERROR: Could not find a version that satisfies the requirement
```
**Solution**:
- Update requirements.txt: `pip freeze > requirements.txt`
- Commit and push: `git push origin main`
- Redeploy manually from Render dashboard

#### 3. Service Spins Down After 15 Minutes
**Solution**:
- Upgrade to Starter+ plan
- Or use free tier for development only

#### 4. CORS Error from Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Backend service → Environment
- Update ALLOWED_ORIGINS to include frontend URL
- Redeploy backend

#### 5. Port Already in Use
```
Address already in use
```
**Solution**:
- Render automatically assigns random port from $PORT variable
- Ensure start command uses: `--port $PORT`

### Vercel Issues

#### 1. API Routes Returning 404
```
Error: The requested endpoint could not be found
```
**Solution**:
- API routes must be in `frontend/pages/api/` (Pages Router)
- Or `frontend/app/api/` (App Router with route.ts files)
- For external API, use NEXT_PUBLIC_API_URL environment variable

#### 2. Image Optimization Error
```
Error: Image not found
```
**Solution**:
- Use next/image for optimization
- External images need `unoptimized: true` in next.config.js:
  ```javascript
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  }
  ```

#### 3. Environment Variables Not Available
```
undefined: NEXT_PUBLIC_API_URL
```
**Solution**:
- Public variables must start with `NEXT_PUBLIC_`
- Go to Project Settings → Environment Variables
- Verify variable is set for Production
- Redeploy: Delete current deployment and push new commit

#### 4. Deployment Fails - Build Error
```
Build failed: Command "npm run build" exited with 1
```
**Solution**:
```bash
# Locally test build
npm run build

# Fix any TypeScript/build errors
npm run lint
npm run type-check

# Commit and push
git push origin main
```

#### 5. Too Many Redirects
```
Error: too many redirects
```
**Solution**:
- Check SSL/TLS settings (Project Settings → Security)
- Verify no redirect loops in next.config.js
- Clear browser cache (Ctrl+Shift+Delete)

### Common Solutions

#### Clear Cache and Redeploy

**Render**:
```bash
# Force redeploy
git commit --allow-empty -m "Force rebuild"
git push origin main
```

**Vercel**:
```bash
# Delete current deployment
# Go to Project Settings → Deployments → Delete all

# Or push new commit
git commit --allow-empty -m "Force rebuild"
git push origin main
```

#### Reset Environment Variables

**Render**:
1. Service → Environment
2. Delete problematic variable
3. Re-add correct value
4. Redeploy

**Vercel**:
1. Project Settings → Environment Variables
2. Update variable value
3. Delete all deployments
4. Push new commit to trigger rebuild

#### Check Deployment Status

**Render**:
```bash
# View real-time logs
curl https://api.render.com/v1/services/[service-id]/logs
```

**Vercel**:
- Dashboard → Deployments → Select deployment
- View build logs in real-time

---

## Performance Tips

### Render Optimization

1. **Use Caching**
   ```python
   # In backend/app/config.py
   REDIS_URL = os.getenv("REDIS_URL")
   ```

2. **Database Connection Pool**
   ```python
   engine = create_engine(
       DATABASE_URL,
       poolclass=NullPool,  # For serverless
       pool_pre_ping=True,
   )
   ```

3. **Monitor Resource Usage**
   - Service Dashboard → Resource usage graph
   - Upgrade if consistently high

### Vercel Optimization

1. **Enable Image Optimization**
   ```typescript
   // next.config.js
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'example.com',
       },
     ],
   }
   ```

2. **Use Edge Runtime** (Pro plan)
   ```typescript
   export const config = {
     runtime: 'edge',
   };
   ```

3. **Bundle Size Analysis**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

---

## Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Set DEBUG=False
- [ ] Configure CORS properly
- [ ] Use HTTPS only
- [ ] Strong database password
- [ ] Rate limiting enabled
- [ ] Environment variables secured (not in git)
- [ ] Regular backups enabled
- [ ] Monitor access logs
- [ ] Update dependencies regularly
- [ ] Enable two-factor authentication on platforms

---

## Cost Analysis

### Render Pricing
- **Free Tier**:
  - $0/month
  - Database spins down after 15 min inactivity
  - Limited to 0.25GB RAM per service
  - Best for: Development

- **Starter+ Plan**:
  - $7/month per service
  - Never spins down
  - 0.5GB RAM
  - 1GB storage (database)
  - Best for: Small production apps

- **Standard Plan**:
  - $12/month per service
  - 1GB RAM
  - 10GB storage
  - Auto-scaling

### Vercel Pricing
- **Hobby Plan** (Free):
  - $0/month
  - Unlimited deployments
  - Global CDN
  - SSL certificate
  - Best for: Personal projects, demos

- **Pro Plan**:
  - $20/month
  - Advanced analytics
  - Priority support
  - Edge functions
  - Increased limits

### Total Estimated Cost
- **Development**: $0/month (both free tiers)
- **Production**: $7-14/month (Render) + $20/month (Vercel Pro) = $27-34/month

---

## Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Custom domain connected
- [ ] SSL certificate verified
- [ ] CORS configured
- [ ] API endpoints tested
- [ ] Frontend loads correctly
- [ ] Auto-deploy enabled
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

Last Updated: January 2026

## Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/Mustaqeemuddin7/smart-link-hub
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
