# Deployment Guide

This guide provides step-by-step instructions for deploying the Haven AI project.

## 🚀 Backend Deployment (Render)

Deploy the Flask backend to [Render](https://render.com/).

### 1. Create a New Web Service
- Connect your GitHub repository.
- Select the `backend` folder as the root directory (or keep project root and adjust commands).

### 2. Configuration Settings
- **Runtime**: `Python`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python run_prod.py` (Waitress server)
- **Region**: Select the region closest to you.

### 3. Environment Variables
Add the following keys from your local `.env` file to Render's **Environment** section:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secure random string for tokens.
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `EMAIL_USER`: Your email for OTP.
- `EMAIL_PASS`: Your email app password.
- `PORT`: `5016` (Render will override this, but `run_prod.py` handles it).

---

## 🎨 Frontend Deployment (Vercel)

Deploy the Next.js frontend to [Vercel](https://vercel.com/).

### 1. Import Project
- Connect your GitHub repository.
- Vercel will auto-detect the Next.js project.

### 2. General Settings
- **Root Directory**: `frontend`
- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3. Environment Variables
Add the following to Vercel's **Environment Variables** section:
- `NEXT_PUBLIC_API_BASE_URL`: The URL of your Render backend (e.g., `https://your-backend.onrender.com`).

---

## ✅ Post-Deployment Checklist
1. Verify the Render backend URL is working (visit `/`).
2. Update the `NEXT_PUBLIC_API_BASE_URL` in Vercel if it changes.
3. Ensure CORS is correctly handled (the backend allows all origins by default in `CORS(app)`).
