# Render Deployment - Fix Build Error

## The Problem

```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

Your `requirements.txt` file **exists** in the backend folder. The issue is the Render build configuration.

---

## Solution: Reconfigure Render Backend Service

### Method 1: Update Build Settings (RECOMMENDED)

**Step 1: Go to Render Dashboard**
1. Dashboard → Select `smart-link-hub-backend` service
2. Click "Settings" tab

**Step 2: Update Build Command**
- Current (Wrong): 
  ```
  pip install -r requirements.txt && alembic upgrade head
  ```
- Change to (Correct):
  ```
  pip install -r ./requirements.txt && alembic upgrade head
  ```
  OR
  ```
  pip install -r backend/requirements.txt && alembic upgrade head
  ```

**Step 3: Check Root Directory**
- Go to "Environment" section
- Verify **Root Directory** is set to: `backend`

**Step 4: Update Start Command**
- Current: 
  ```
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- Should be correct as-is (stays same)

**Step 5: Save and Redeploy**
- Click "Save Changes"
- Go to "Deployments"
- Click "Trigger Deploy"
- Watch the build logs

---

## Method 2: Remove Root Directory Setting (ALTERNATIVE)

If Method 1 doesn't work, try this:

**Step 1: Update Settings**
1. Go to service settings
2. **Remove** the "Root Directory" setting (clear it)
3. Update build and start commands to include full path:

   **Build Command**:
   ```
   cd backend && pip install -r requirements.txt && alembic upgrade head
   ```

   **Start Command**:
   ```
   cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

**Step 2: Save and Redeploy**
- Click "Save"
- Trigger new deployment

---

## Understanding the Issue

The problem occurs because:

1. **Your file structure**:
   ```
   smart-link-hub/
   ├── backend/
   │   ├── requirements.txt   ← File is HERE
   │   ├── app/
   │   └── alembic/
   └── frontend/
   ```

2. **What Render does with "Root Directory: backend"**:
   - Changes working directory to `backend/`
   - Now looking from: `smart-link-hub/backend/`
   - Build command runs as: `pip install -r requirements.txt`
   - This works if command is: `pip install -r ./requirements.txt`

3. **Why it fails**:
   - Sometimes Render's working directory isn't set correctly
   - The build command might be running from wrong location
   - Path resolution issue

---

## Correct Render Configuration

### For `smart-link-hub-backend` Service:

| Setting | Value |
|---------|-------|
| **Name** | smart-link-hub-backend |
| **Environment** | Python 3.11 |
| **Branch** | main |
| **Root Directory** | backend |
| **Build Command** | pip install -r ./requirements.txt && alembic upgrade head |
| **Start Command** | uvicorn app.main:app --host 0.0.0.0 --port $PORT |

---

## Step-by-Step Fix (With Screenshots Reference)

### Step 1: Access Service Settings
```
Render Dashboard 
  → Services 
    → smart-link-hub-backend 
      → Settings
```

### Step 2: Scroll to "Build Command"
Find the section showing:
```
Build Command: pip install -r requirements.txt && alembic upgrade head
```

### Step 3: Edit to Add "./"
Change it to:
```
Build Command: pip install -r ./requirements.txt && alembic upgrade head
```

### Step 4: Scroll to "Start Command"
Verify it shows:
```
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Step 5: Click "Save Changes"
Button at bottom right

### Step 6: Trigger Redeploy
```
Render Dashboard 
  → Services 
    → smart-link-hub-backend 
      → Deployments 
        → "Trigger Deploy" button
```

### Step 7: Monitor Build
- Watch the build log in real-time
- Should see:
  ```
  ✓ Building...
  ✓ Installing dependencies
  ✓ Running migrations
  ✓ Deployed successfully!
  ```

---

## Verify It's Fixed

Once redeployed:

```powershell
# Test the API
curl "https://smart-link-hub-backend.onrender.com/docs"

# Should return HTML (not error)
```

---

## If Still Not Working

### Check These:

1. **Verify requirements.txt Syntax**
   ```bash
   # Run locally to test
   cd backend
   pip install -r requirements.txt
   ```

2. **Check for Typos**
   - Make sure it's `requirements.txt` (not `requirement.txt`)
   - Check capitalization

3. **View Render Logs**
   - Go to service → Logs
   - Look for exact error message
   - Copy error and Google it

4. **Nuclear Option: Rebuild from Scratch**
   ```
   Delete service → Create new service → Configure carefully
   ```

---

## Quick Fix Commands

If you want to push a small fix and retrigger:

```powershell
# Navigate to project
cd smart-link-hub

# Make empty commit to retrigger build
git commit --allow-empty -m "fix: trigger rebuild with corrected paths"

# Push to main
git push origin main

# Render will automatically redeploy
```

---

## Expected Success Output

After fix, build logs should show:
```
11:25:00 Building...
11:25:05 Installing dependencies from requirements.txt
11:25:30 Successfully installed fastapi uvicorn sqlalchemy... (all packages)
11:25:35 Running: alembic upgrade head
11:25:40 Migration completed successfully
11:26:00 Starting uvicorn app.main:app...
11:26:05 ✓ Service is live at https://smart-link-hub-backend.onrender.com
```

---

## Summary

✅ **Your `requirements.txt` exists and is correct**
❌ **Render build path configuration is wrong**
✅ **Easy fix: Update build command with correct path**

**Next Action**: Go to Render → Update build command → Redeploy

Questions? Check [Render Build Troubleshooting](https://render.com/docs/troubleshooting-deploys)
