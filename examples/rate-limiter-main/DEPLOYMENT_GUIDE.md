# 🚀 Deployment Guide - Beta Land @ ASU

This document explains how to deploy the Beta Land @ ASU application to different environments.

## 📋 Overview

The application has two main deployment methods:
1. **GitHub Pages** (Frontend) - Public demo without API keys
2. **Google Cloud Run** (Backend) - Full API functionality

## 🌐 GitHub Pages Deployment (Frontend)

### Method: Traditional gh-pages Branch

**✅ Current Setup**: The repository uses the traditional `gh-pages` branch method for GitHub Pages deployment.

### Quick Deployment

```bash
./deploy-pages.sh
```

### Manual Deployment Steps

1. **Ensure you're on main branch**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Build for production** (secure mode - no API keys):
   ```bash
   export REACT_APP_ENVIRONMENT=production
   export REACT_APP_DEFAULT_MODEL=gemini-2.0-flash
   export REACT_APP_ENABLE_IMAGE_GENERATION=false
   export REACT_APP_ENABLE_CODE_EXECUTION=false
   export REACT_APP_ENABLE_SEARCH_GROUNDING=false
   
   npm ci
   npm run build
   ```

3. **Deploy to gh-pages branch**:
   ```bash
   npx gh-pages -d build
   ```

### 🔒 Security Features

- **No API keys** in production build
- **Demo mode banner** explains limitations
- **Only local Llama models** available
- **Safe for public access**

### Site URL
**Live Site**: https://danielennis11111.github.io/rate-limiter/

---

## ☁️ Google Cloud Run Deployment (Backend)

### Method: Cloud Run with Secret Manager

**Script**: Use the existing `deploy.sh` for backend deployment.

### Quick Backend Deployment

```bash
./deploy.sh
```

### Manual Backend Steps

1. **Set up environment**:
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

2. **Deploy to Cloud Run**:
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/beta-land-asu-backend .
   gcloud run deploy beta-land-asu-backend \
     --image gcr.io/YOUR_PROJECT/beta-land-asu-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

---

## 🛠️ Development vs Production

### Local Development
- Full API access with your keys
- All features enabled
- All AI models available

### GitHub Pages (Production)
- No API keys (security)
- Demo mode banner
- Local models only
- Public access safe

---

## 🚫 Disabled Methods

### GitHub Actions Workflow
**File**: `.github/workflows/deploy.yml`
**Status**: ❌ DISABLED

**Why disabled**: 
- Conflicts with existing gh-pages branch setup
- GitHub Actions was failing
- Traditional method more reliable

**To re-enable**: Remove `if: false` and uncomment the push trigger

---

## 📝 Troubleshooting

### Common Issues

1. **"gh-pages not found"**:
   ```bash
   npm install gh-pages --save-dev
   ```

2. **Permission denied on deploy-pages.sh**:
   ```bash
   chmod +x deploy-pages.sh
   ```

3. **Build fails with API key errors**:
   - Ensure API keys are NOT set in production build
   - Check environment variables are correctly excluded

4. **GitHub Pages not updating**:
   - Wait 1-2 minutes after deployment
   - Check GitHub repository Settings > Pages
   - Verify gh-pages branch has new content

### Build Warnings
ESLint warnings are normal and don't prevent deployment. To fix:
- Remove unused imports
- Add dependency array to useEffect hooks
- Use eslint-disable-next-line for intentional unused variables

---

## 🔄 Update Workflow

1. Make changes on `main` branch
2. Test locally with your API keys
3. Commit and push to `main`
4. Run `./deploy-pages.sh` when ready to deploy
5. Wait 1-2 minutes for GitHub Pages to update

---

## 📊 Deployment Status

| Environment | Method | Status | URL |
|-------------|--------|--------|-----|
| GitHub Pages | gh-pages branch | ✅ Active | https://danielennis11111.github.io/rate-limiter/ |
| GitHub Actions | Workflow | ❌ Disabled | N/A |
| Cloud Run Backend | deploy.sh | ✅ Available | Run ./deploy.sh for URL |

---

## 💡 Best Practices

1. **Always test locally first** before deploying
2. **Never commit API keys** to the repository
3. **Use the deploy script** instead of manual commands
4. **Check build output** for any errors before deploying
5. **Document any deployment changes** in this file 