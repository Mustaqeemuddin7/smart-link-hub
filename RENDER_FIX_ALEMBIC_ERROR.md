# Render Deployment - Fix Alembic Error

## The Problem

```
FAILED: No 'script_location' key found in configuration.
```

This means Alembic can't find its configuration file (`alembic.ini`) because the build command is running from the wrong directory.

---

## Root Cause Analysis

Your file structure:
```
backend/
├── alembic.ini              ← Alembic config is HERE
├── alembic/
│   ├── env.py
│   ├── versions/
│   │   ├── 001_initial.py
│   │   └── ...
├── requirements.txt
└── app/
    └── main.py
```

When Render runs: `pip install -r ./requirements.txt && alembic upgrade head`

It's looking for `alembic.ini` from the wrong working directory!

---

## Solution 1: Fix Build Command (RECOMMENDED)

**Go to Render Dashboard**:
1. Service: `smart-link-hub-backend`
2. Settings → Build & Deploy section
3. Find "Build Command"

**Change from**:
```
pip install -r ./requirements.txt && alembic upgrade head
```

**Change to**:
```
pip install -r ./requirements.txt && cd backend && alembic upgrade head
```

**OR** (even simpler):
```
pip install -r requirements.txt
```

Then keep migrations in start command instead.

---

## Solution 2: Skip Migrations on Build (SAFER)

If migrations cause issues, you can skip them during build and run them separately:

**Step 1: Update Build Command to**:
```
pip install -r ./requirements.txt
```

**Step 2: Create Migration Helper Script**

Create file: `backend/run_migrations.py`

```python
#!/usr/bin/env python
import subprocess
import sys

try:
    print("Running database migrations...")
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        cwd="backend"
    )
    if result.returncode != 0:
        print("⚠️ Migrations failed, but continuing startup...")
        sys.exit(0)  # Don't fail the entire startup
except Exception as e:
    print(f"⚠️ Could not run migrations: {e}")
    print("Application will start anyway...")
```

**Step 3: Update Start Command**:
```
python run_migrations.py && cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Solution 3: Best Practice - Use Render Pre-Deploy Hook

**Step 1: Create file `render.yaml` in project root**:

```yaml
services:
  - type: web
    name: smart-link-hub-backend
    runtime: python
    plan: free
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        sync: false
```

**Step 2: Push and Render reads this configuration**

---

## Recommended Fix (RIGHT NOW)

**This is the easiest fix that will work immediately**:

### Step-by-Step:

**1. Go to Render Dashboard**
- Services → `smart-link-hub-backend`
- Settings

**2. Update Build Command**
```
pip install -r ./requirements.txt
```

(Remove the alembic upgrade from build)

**3. Update Start Command**
```
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

This way:
- Build just installs dependencies ✅
- Start runs migrations, then starts the app ✅
- Alembic runs from correct directory ✅

**4. Save Changes → Trigger Deploy**

---

## Why This Works

```
Build Phase:
  - Working dir: /app
  - Command: pip install -r ./requirements.txt
  - Result: Dependencies installed ✅

Start Phase:
  - Working dir: /app
  - Command: alembic upgrade head && uvicorn ...
  - Alembic finds alembic.ini correctly ✅
```

---

## If Still Failing: Debug Steps

### Check 1: Verify alembic.ini Exists

```powershell
# Locally, check file exists
Get-Item "c:\Users\Mustaqeem Uddin\Desktop\unstop\smart-link-hub\backend\alembic.ini"
```

**Expected Output**:
```
Mode                 LastWriteTime         Length Name
----                 -------                ------ ----
-a---          1/27/2026  11:34 AM           1234 alembic.ini
```

### Check 2: Verify alembic/ Directory

```powershell
Get-ChildItem "c:\Users\Mustaqeem Uddin\Desktop\unstop\smart-link-hub\backend\alembic" -Recurse
```

**Should show**:
```
alembic/
├── __pycache__/
├── versions/
│   ├── 001_initial.py
│   ├── 002_add_cascade_delete_to_foreign_keys.py
│   └── 000625115f71_add_short_urls_table.py
├── env.py
└── script.py.mako
```

### Check 3: Run Locally to Test

```bash
cd backend
alembic upgrade head
```

If this works locally, it will work in Render with correct configuration.

---

## Complete Render Configuration (Copy This)

Go to Render Dashboard → Service Settings → Fill in these EXACTLY:

| Field | Value |
|-------|-------|
| **Name** | smart-link-hub-backend |
| **Environment** | Python 3.11 |
| **Branch** | main |
| **Root Directory** | backend |
| **Build Command** | pip install -r ./requirements.txt |
| **Start Command** | alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT |

Then add environment variables:
- DATABASE_URL
- SECRET_KEY
- ALGORITHM
- ACCESS_TOKEN_EXPIRE_MINUTES
- DEBUG
- ALLOWED_ORIGINS

---

## After Updating: How to Redeploy

**Option A: Manual Trigger** (Fastest)
1. Render Dashboard
2. Service: `smart-link-hub-backend`
3. Deployments tab
4. Click "Trigger Deploy" button
5. Watch logs in real-time

**Option B: Push Empty Commit**
```powershell
cd smart-link-hub
git commit --allow-empty -m "fix: update render build configuration"
git push origin main
```

Render will auto-redeploy.

---

## Success Indicator

After deploying with fixed configuration, you should see in logs:

```
11:40:00 AM Building...
11:40:05 AM Installing dependencies...
11:40:30 AM ✓ Build successful
11:40:35 AM Starting service...
11:40:40 AM Running migrations...
11:40:45 AM INFO [alembic.runtime.migration] Context impl PostgresqlImpl
11:40:45 AM INFO [alembic.runtime.migration] Will assume transactional DDL is supported by the database
11:40:46 AM INFO [alembic.runtime.migration] Running upgrade... done
11:40:50 AM Uvicorn running on http://0.0.0.0:PORT
11:40:52 AM ✓ Service is live
```

---

## Alternative: Disable Migrations on Deploy (If Emergency)

If you need to deploy quickly and fix migrations later:

**Build Command**:
```
pip install -r ./requirements.txt
```

**Start Command**:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Then manually run migrations later via:
```bash
render logs  # Check if DB connection works
# Once DB works, do migration locally or via custom script
```

---

## Possible Additional Issues

### Issue: DATABASE_URL Not Set
If migrations fail because database isn't available yet:
```bash
# Make sure DATABASE_URL environment variable is set in Render
Render Dashboard → Settings → Environment Variables
→ Add DATABASE_URL with correct value
```

### Issue: Database Not Ready
Migrations might fail if database is still starting:
```bash
# Add retry logic (Python script approach)
import time
import subprocess

for attempt in range(3):
    try:
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        break
    except:
        if attempt < 2:
            print(f"Retry {attempt + 1}...")
            time.sleep(5)
        else:
            raise
```

---

## Quick Fix Summary

```
❌ WRONG BUILD COMMAND:
pip install -r ./requirements.txt && alembic upgrade head

✅ CORRECT BUILD COMMAND:
pip install -r ./requirements.txt

✅ CORRECT START COMMAND:
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Next Action**: Update these two commands in Render and redeploy.

---

## Still Not Working?

1. **Check Render Logs** (Real-time monitoring)
   - Dashboard → Service → Logs
   - Look for exact error message

2. **Test Locally First**
   ```bash
   cd backend
   alembic upgrade head
   # Should work without errors
   ```

3. **Verify Database URL**
   - Copy DATABASE_URL from Render database service
   - Paste into backend environment variables
   - Make sure it's the INTERNAL URL (not external)

4. **Last Resort: Nuclear Option**
   - Delete service
   - Create brand new service
   - Configure carefully with correct settings from this guide

---

**Good luck! 🚀 This should fix the Alembic error.**

Last Updated: January 2026
