#!/bin/bash

# Beta Land @ ASU - Google Cloud Run Deployment Script
# This script deploys the backend to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Beta Land @ ASU - Google Cloud Run Deployment${NC}"
echo "=================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud CLI not found. Please install it first:${NC}"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated. Running gcloud auth login...${NC}"
    gcloud auth login
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No project set. Please set your project:${NC}"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✅ Using project: $PROJECT_ID${NC}"

# Set variables
SERVICE_NAME="beta-land-asu-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Enable required APIs
echo -e "${BLUE}🔧 Enabling required Google Cloud APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Check for Gemini API key
echo -e "${BLUE}🔑 Setting up Gemini API key...${NC}"
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY environment variable not set.${NC}"
    read -p "Please enter your Gemini API key: " GEMINI_API_KEY
fi

# Store API key in Secret Manager
echo -e "${BLUE}🔐 Storing API key in Secret Manager...${NC}"
echo "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=- --replication-policy="automatic" || \
echo "$GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-

# Build and deploy
echo -e "${BLUE}🏗️  Building and deploying to Cloud Run...${NC}"
cd backend

# Build the container
gcloud builds submit --tag $IMAGE_NAME .

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID" \
    --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Backend URL: $SERVICE_URL${NC}"
echo -e "${GREEN}✅ Health Check: $SERVICE_URL/health${NC}"
echo -e "${GREEN}✅ Frontend: https://danielennis11111.github.io/rate-limiter/${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Update your frontend to use the backend URL: $SERVICE_URL"
echo "2. Test the health endpoint: curl $SERVICE_URL/health"
echo "3. Configure CORS if needed for your frontend domain"
echo ""
echo -e "${YELLOW}💡 To view logs: gcloud logs tail --service=$SERVICE_NAME${NC}"
echo -e "${YELLOW}💡 To update: Re-run this script${NC}" 