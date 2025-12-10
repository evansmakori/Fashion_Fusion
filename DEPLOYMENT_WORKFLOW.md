# Deployment Workflow - Fashion Fusion

## How to Deploy Changes to Live App

### 📋 Step-by-Step Deployment Process

#### 1️⃣ Make Your Changes
Edit any files you want to change in your project.

#### 2️⃣ Test Locally (Optional but Recommended)
```bash
# Test frontend changes
cd src/frontend-service
npm run dev
# Open http://localhost:5173

# Test backend if changed
cd firebase-backend
npm start
# Test on http://localhost:3001
```

#### 3️⃣ Build the Project
```bash
# From project root
npm run build
```

This will:
- Build frontend (Vite)
- Create static bundle
- Compile TypeScript
- Generate all dist files

#### 4️⃣ Deploy to Raindrop
```bash
# Stop current version
raindrop build stop

# Deploy new version
raindrop build deploy --start
```

This will:
- Build all services
- Upload to Raindrop platform
- Start all 12 modules

#### 5️⃣ Verify Deployment
```bash
# Check status
raindrop build status

# Test the live URL
curl https://svc-01kb2kaj6e225wh9hdv8rwfpfc.01kaabs55f12xsvgzarqrjkdsa.lmapp.run/
```

---

## ⚠️ Current Known Issue

**Problem:** The Raindrop platform has been caching deployments and not picking up new changes.

**Symptoms:**
- Deployment says "success" but serves old code
- Changes in code don't appear on live site
- Same version ID persists even after new deployments

**Current Workaround:**
Since the platform is caching, your options are:

### Option A: Wait and Retry
The cache might clear eventually. Try deploying again in a few hours or days.

### Option B: Test Locally
```bash
cd src/frontend-service
npm run dev
```
This lets you see all your changes immediately without deployment issues.

### Option C: Deploy Backend Separately
If you're changing backend logic, deploy the Node.js backend separately:

```bash
cd firebase-backend

# Deploy to Railway.app
railway up

# Or Render.com (connect via dashboard)

# Or Cloud Run
gcloud run deploy fashion-fusion-backend --source .
```

Then update the `FIREBASE_BACKEND_URL` in your Worker.

### Option D: Use Different Platform
Deploy your frontend to:
- **Vercel:** `vercel deploy`
- **Netlify:** `netlify deploy`
- **GitHub Pages:** Works for static sites

---

## 🔄 Quick Commands Reference

### Deploy Everything
```bash
npm run build && raindrop build deploy --start
```

### Deploy and Check Status
```bash
raindrop build deploy --start && sleep 10 && raindrop build status
```

### Force Clean Build
```bash
rm -rf dist src/frontend-service/dist
npm run build
raindrop build stop
raindrop build deploy --start
```

### Check What's Running
```bash
raindrop build status
raindrop build list
```

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Changes made to code
- [ ] Tested locally (optional)
- [ ] `npm run build` completed successfully
- [ ] No TypeScript errors
- [ ] All assets included (images, videos)

After deploying:
- [ ] `raindrop build status` shows "running"
- [ ] All 12 modules active
- [ ] Test live URL in browser
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Verify changes appear

---

## 🐛 Troubleshooting

### Changes Don't Appear After Deployment

**Check 1: Hard Refresh**
```
Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

**Check 2: Verify Build Worked**
```bash
# Check if new files exist
ls -lh dist/frontend-service/index.js
cat src/frontend-service/dist/index.html
```

**Check 3: Check Version**
```bash
raindrop build status
# Look at "converged" timestamp - should be recent
```

**Check 4: Check Logs**
```bash
raindrop logs tail
```

### Build Fails

**Check TypeScript Errors:**
```bash
npm run build
# Look for error messages
```

**Fix Common Issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

---

## 🚀 Best Practice Workflow

### For Frontend Changes:
1. Edit files in `src/frontend-service/`
2. Test: `cd src/frontend-service && npm run dev`
3. Build: `npm run build` (from root)
4. Deploy: `raindrop build deploy --start`

### For Backend Changes:
1. Edit files in `firebase-backend/`
2. Test: `cd firebase-backend && npm start`
3. Deploy backend separately (Railway/Render)
4. No Worker deployment needed

### For API Gateway Changes:
1. Edit files in `src/api-gateway/`
2. Build: `npm run build`
3. Deploy: `raindrop build deploy --start`

---

## 📊 Understanding Deployment

### What Gets Deployed:
```
dist/
├── frontend-service/index.js (12MB) - Contains embedded frontend
├── api-gateway/index.js (7MB) - API routing
├── image-generation-service/index.js
├── image-analysis-service/index.js
├── product-service/index.js
├── order-service/index.js
└── payment-service/index.js
```

### Deployment Flow:
```
npm run build
    ↓
Builds frontend (Vite)
    ↓
Creates static bundle (embeds assets)
    ↓
Compiles TypeScript
    ↓
Generates dist/
    ↓
raindrop build deploy
    ↓
Uploads to Raindrop
    ↓
Services start
    ↓
Live on URL!
```

---

## 💡 Pro Tips

1. **Always test locally first** before deploying
2. **Keep git commits separate** from deployments
3. **Check build output** for errors before deploying
4. **Use version control** - commit before deploying
5. **Document your changes** in commit messages
6. **Clear browser cache** after deployment
7. **Check logs** if something doesn't work

---

## 🆘 If Deployment Still Doesn't Work

Due to the current platform caching issue:

1. **Contact Raindrop Support:**
   - Explain the caching issue
   - Provide version IDs
   - Ask for cache clear

2. **Alternative: Deploy Frontend Elsewhere:**
   ```bash
   cd src/frontend-service
   npm run build
   # Then deploy dist/ to Vercel/Netlify
   ```

3. **Keep Backend Separate:**
   - Deploy firebase-backend to Railway/Render
   - This works independently of Worker

---

**Created:** December 2024  
**Status:** Deployment process documented with known issues
