#!/bin/bash
# NutriQuest — Manual Cloud Run Deployment Script
# Prerequisites: gcloud CLI authenticated, PROJECT_ID set

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-your-gcp-project-id}"
REGION="${REGION:-asia-south1}"
REPO="nutriquest"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

echo "🚀 Deploying NutriQuest to Cloud Run"
echo "   Project: ${PROJECT_ID}"
echo "   Region:  ${REGION}"

# ─── Step 1: Create Artifact Registry repo (idempotent) ────────────────────
echo "📦 Setting up Artifact Registry..."
gcloud artifacts repositories create "${REPO}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="NutriQuest container images" \
  2>/dev/null || echo "  Repository already exists."

gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ─── Step 2: Store secrets in Secret Manager ───────────────────────────────
echo "🔐 Setting up secrets (if not already stored)..."
echo "   → You'll need to manually add your API keys:"
echo "      gcloud secrets create gemini-api-key --data-file=- <<< 'YOUR_KEY'"
echo "      gcloud secrets create firebase-credentials --data-file=firebase-service-account.json"

# ─── Step 3: Build & push Frontend ────────────────────────────────────────
echo "🏗️  Building frontend..."
gcloud builds submit ./frontend \
  --tag="${REGISTRY}/frontend:latest" \
  --project="${PROJECT_ID}"

# ─── Step 4: Build & push Backend ─────────────────────────────────────────
echo "🏗️  Building backend..."
gcloud builds submit ./backend \
  --tag="${REGISTRY}/backend:latest" \
  --project="${PROJECT_ID}"

# ─── Step 5: Deploy Backend first (frontend needs its URL) ────────────────
echo "🚀 Deploying backend..."
BACKEND_URL=$(gcloud run deploy nutriquest-backend \
  --image="${REGISTRY}/backend:latest" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --set-env-vars="FRONTEND_URL=https://nutriquest-frontend-PLACEHOLDER.run.app" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)" 2>&1 | tail -1)

echo "   Backend: ${BACKEND_URL}"

# ─── Step 6: Deploy Frontend ──────────────────────────────────────────────
echo "🚀 Deploying frontend..."
FRONTEND_URL=$(gcloud run deploy nutriquest-frontend \
  --image="${REGISTRY}/frontend:latest" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --project="${PROJECT_ID}" \
  --format="value(status.url)" 2>&1 | tail -1)

echo "   Frontend: ${FRONTEND_URL}"

# ─── Step 7: Update backend CORS with real frontend URL ───────────────────
echo "🔄 Updating backend CORS..."
gcloud run services update nutriquest-backend \
  --region="${REGION}" \
  --set-env-vars="FRONTEND_URL=${FRONTEND_URL}" \
  --project="${PROJECT_ID}"

echo ""
echo "✅ Deployment complete!"
echo "   Frontend: ${FRONTEND_URL}"
echo "   Backend:  ${BACKEND_URL}"
echo ""
echo "📝 Next steps:"
echo "   1. Add VITE_* env vars to frontend build or use runtime config"
echo "   2. Configure Firebase Auth authorized domains with ${FRONTEND_URL}"
echo "   3. Set up Cloud Build trigger: gcloud builds triggers create github ..."
