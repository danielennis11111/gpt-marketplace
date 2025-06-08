# Beta Land @ ASU - Cloud Deployment Guide

This guide walks you through deploying Beta Land @ ASU to Google Cloud Run with secure Gemini API integration.

## 🎯 Architecture Overview

- **Frontend**: GitHub Pages at https://danielennis11111.github.io/rate-limiter/
- **Backend**: Google Cloud Run (serverless, auto-scaling)
- **AI Models**: Google Gemini API (2.5 Pro, 2.0 Flash, etc.)
- **Security**: Google Secret Manager for API keys
- **Monitoring**: Google Cloud Logging

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed and authenticated
3. **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
4. **Git** and basic terminal knowledge

## 🚀 Quick Deployment

### Step 1: Install Google Cloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate and Set Project

```bash
# Login to Google Cloud
gcloud auth login

# Set your project (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 3: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key for the next step

### Step 4: Deploy with One Command

```bash
# Export your Gemini API key
export GEMINI_API_KEY="your_api_key_here"

# Run the deployment script
./deploy.sh
```

That's it! The script will:
- ✅ Enable all required Google Cloud APIs
- ✅ Store your API key securely in Secret Manager
- ✅ Build and deploy the backend to Cloud Run
- ✅ Configure CORS for your GitHub Pages frontend
- ✅ Set up auto-scaling and security settings

## 🔧 Manual Deployment (Advanced)

If you prefer manual control or need to troubleshoot:

### 1. Store API Key in Secret Manager

```bash
echo "your_gemini_api_key" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"
```

### 2. Build and Deploy Backend

```bash
cd backend

# Build the container image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/beta-land-asu-backend .

# Deploy to Cloud Run
gcloud run deploy beta-land-asu-backend \
    --image gcr.io/YOUR_PROJECT_ID/beta-land-asu-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID" \
    --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"
```

### 3. Update Frontend Configuration

After deployment, update your frontend to use the new backend URL:

```typescript
// In src/services/CloudBackendService.ts
const defaultBaseUrl = 'https://your-service-url-here.run.app';
```

## 🔒 Security Features

- **Secret Manager**: API keys stored securely, never in code
- **CORS Protection**: Only your frontend domain can access the API
- **IAM Security**: Proper Google Cloud IAM roles and permissions
- **HTTPS Only**: All communication encrypted in transit
- **Rate Limiting**: Built-in protection against abuse
- **Container Security**: Non-root user, minimal attack surface

## 📊 Monitoring & Debugging

### View Logs
```bash
gcloud logs tail --service=beta-land-asu-backend
```

### Check Service Status
```bash
gcloud run services describe beta-land-asu-backend \
    --platform managed \
    --region us-central1
```

### Test Health Endpoint
```bash
curl https://your-service-url.run.app/health
```

## 💰 Cost Optimization

Google Cloud Run pricing is pay-per-use:
- **No traffic = $0 cost** (scales to zero)
- **1M requests ≈ $0.40** (very affordable)
- **CPU only charged during request processing**

Current configuration:
- Memory: 1GB (can be reduced if needed)
- CPU: 1 vCPU (sufficient for most workloads)
- Min instances: 0 (cost-optimized)
- Max instances: 10 (handles traffic spikes)

## 🔄 Updates & Maintenance

### Update Backend Code
```bash
# After making changes to backend/
./deploy.sh
```

### Update Gemini API Key
```bash
echo "new_api_key" | gcloud secrets versions add gemini-api-key --data-file=-
```

### Scale Resources (if needed)
```bash
gcloud run services update beta-land-asu-backend \
    --memory 2Gi \
    --cpu 2 \
    --region us-central1
```

## 🌟 Features Enabled

Your deployed backend supports all latest Gemini capabilities:

- ✅ **Gemini 2.5 Pro** - Advanced reasoning and thinking mode
- ✅ **Gemini 2.0 Flash** - Real-time multimodal with image generation
- ✅ **Gemini 2.0 Flash Lite** - Fast and cost-efficient processing
- ✅ **Google Search Grounding** - Real-time information access
- ✅ **Code Execution** - Live programming environment
- ✅ **Streaming Responses** - Real-time conversation flow
- ✅ **Multimodal Processing** - Text, images, documents, audio

## 🆘 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   ```bash
   gcloud auth application-default login
   ```

2. **"API not enabled" errors**
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com
   ```

3. **Frontend can't connect to backend**
   - Check CORS configuration in `backend/app.py`
   - Verify the backend URL in `CloudBackendService.ts`
   - Test health endpoint: `curl YOUR_BACKEND_URL/health`

4. **Gemini API errors**
   - Verify API key in Secret Manager
   - Check quotas in Google Cloud Console
   - Review logs: `gcloud logs tail --service=beta-land-asu-backend`

### Get Help

- **Google Cloud Run Docs**: https://cloud.google.com/run/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **GitHub Issues**: Report bugs in this repository

## 🎉 Success!

Once deployed, you'll have:

1. **Secure Backend**: Running on Google Cloud Run
2. **Frontend**: Already deployed at https://danielennis11111.github.io/rate-limiter/
3. **Latest Gemini Models**: 2.5 Pro, 2.0 Flash, and more
4. **Production Ready**: Auto-scaling, monitoring, security
5. **Cost Effective**: Pay only for what you use

Your AI adventure platform is now running in the cloud! 🚀 