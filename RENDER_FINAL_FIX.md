# Render Deployment - Fix 'script_location' Error

## The Problem

```
FAILED: No 'script_location' key found in configuration.
```

Your current commands are incorrect:

**Build Command** (Wrong):
```
pip install -r backend/requirements.txt && alembic upgrade head
```

**Start Command** (Wrong):
```
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Root Cause

When you set **Root Directory: `backend`** in Render, it changes the working directory to the backend folder.

So when your build command runs:
- It's already IN the `backend` folder
- Running `pip install -r backend/requirements.txt` looks for `backend/backend/requirements.txt` ❌
- Running `alembic upgrade head` from wrong directory, can't find `alembic.ini` ❌

---

## THE FIX - Copy These Exact Commands

### Fix 1: RECOMMENDED - Simplest Approach

**Go to Render Dashboard**:
1. Service: `smart-link-hub-backend`
2. Settings → Build & Deploy

**Replace Build Command with**:
```
pip install -r requirements.txt
```

**Replace Start Command with**:
```
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

✅ This works because:
- `pip install -r requirements.txt` - finds it in current (backend) folder
- `alembic upgrade head` - finds alembic.ini in current (backend) folder
- `uvicorn app.main:app` - app is in current folder structure

---

### Fix 2: If Root Directory is NOT Set

If you removed "Root Directory" setting, use:

**Build Command**:
```
cd backend && pip install -r requirements.txt
```

**Start Command**:
```
cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

### Fix 3: Using Full Paths (NOT Recommended)

If you want to keep it generic:

**Build Command**:
```
pip install -r backend/requirements.txt && cd backend && alembic upgrade head
```

**Start Command**:
```
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## EXACT STEPS TO FIX RIGHT NOW

### Step 1: Go to Render
- Open https://dashboard.render.com
- Click on `smart-link-hub-backend` service

### Step 2: Go to Settings
- Click "Settings" tab at top

### Step 3: Find Build Command
- Scroll down to "Build & Deploy" section
- Find the field showing:
  ```
  pip install -r backend/requirements.txt && alembic upgrade head
  ```

### Step 4: Clear and Paste New Build Command
- Click in the field
- Select all text (Ctrl+A)
- Delete
- Paste this:
  ```
  pip install -r requirements.txt
  ```

### Step 5: Find Start Command
- Scroll to "Start Command" field
- Shows:
  ```
  alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### Step 6: Verify Start Command
- The start command is ALREADY CORRECT ✅
- Just make sure it shows exactly:
  ```
  alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### Step 7: Save
- Scroll down
- Click "Save Changes" button

### Step 8: Redeploy
- Go to "Deployments" tab
- Click "Trigger Deploy" button
- Watch the logs in real-time

---

## What You Should See (Success Logs)

```
11:50:00 AM Building...
11:50:05 AM Installing dependencies...
11:50:10 AM [notice] A new release of pip is available: 25.1.1 -> 25.3
11:50:15 AM Successfully installed mako-1.3.10 markupsafe-3.0.3 pillow-12.1.0 alembic-1.13.1...
11:50:20 AM ✓ Build successful
11:50:25 AM Starting service...
11:50:30 AM Running: alembic upgrade head
11:50:35 AM INFO [alembic.runtime.migration] Context impl PostgresqlImpl.
11:50:35 AM INFO [alembic.runtime.migration] Will assume transactional DDL is supported by the database.
11:50:40 AM INFO [alembic.runtime.migration] Running upgrade...
11:50:45 AM INFO [alembic.runtime.migration] done
11:50:50 AM Uvicorn running on http://0.0.0.0:PORT
11:50:55 AM ✓ Service is live
```

---

## Key Points

| Scenario | Root Directory | Build Command | Start Command |
|----------|---|---|---|
| **Root Directory SET to `backend`** | `backend` | `pip install -r requirements.txt` | `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Root Directory EMPTY** | (empty) | `cd backend && pip install -r requirements.txt` | `cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

---

## Troubleshooting

### If Still Getting Same Error:

**1. Double-check Root Directory**
- Go to Settings
- Look for "Root Directory" field
- Should be exactly: `backend`
- NOT `backend/` or `./backend`

**2. Check Build Command**
- Should be exactly: `pip install -r requirements.txt`
- NOT `pip install -r backend/requirements.txt`

**3. Check for Typos**
- `requirements.txt` (not `requirement.txt`)
- `alembic` (not `alembci` or `alabic`)
- No extra spaces

**4. Verify alembic.ini Exists**
- Check GitHub: Is `backend/alembic.ini` in your repo?
- If not, add it

**5. Nuclear Option - Delete & Recreate**
- Delete service
- Create new with correct settings from start

---

## Verify Settings Before Deploy

Before clicking "Trigger Deploy", your settings should be:

```
Service Name:     smart-link-hub-backend
Environment:      Python 3.11
Branch:           main
Root Directory:   backend
Build Command:    pip install -r requirements.txt
Start Command:    alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables** (should have):
- DATABASE_URL
- SECRET_KEY
- ALGORITHM
- ACCESS_TOKEN_EXPIRE_MINUTES
- DEBUG
- ALLOWED_ORIGINS

---

## After Deploy - Test It

Once it says "Live" with green checkmark:

```powershell
# Test the API
curl "https://smart-link-hub-backend.onrender.com/docs"

# Should show OpenAPI docs (NOT 502 error)
```

---

## Success Checklist

- [ ] Updated Build Command to: `pip install -r requirements.txt`
- [ ] Verified Start Command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Verified Root Directory is: `backend`
- [ ] Clicked "Save Changes"
- [ ] Clicked "Trigger Deploy"
- [ ] Watched logs complete successfully
- [ ] Got "Service is live" message
- [ ] Tested `/docs` endpoint
- [ ] No errors in logs

---

**You're almost there! Just update those two commands and redeploy. 🚀**

Last Updated: January 2026
