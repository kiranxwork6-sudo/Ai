# How to Deploy AI Receptionist to Vercel 🚀

The project is now fully pre-configured for Vercel with:
- [`vercel.json`](file:///c:/Users/akhil/Documents/Ai%20Reseptionist/vercel.json): Automatically routes frontend builds and backend serverless API endpoints.
- [`api/index.js`](file:///c:/Users/akhil/Documents/Ai%20Reseptionist/api/index.js): Vercel Serverless Function entrypoint wrapping the Express API.
- [`server/storage/db.js`](file:///c:/Users/akhil/Documents/Ai%20Reseptionist/server/storage/db.js): Gracefully handles Vercel's serverless filesystem using `os.tmpdir()`.

---

## Method 1: Deploy via GitHub (Recommended)

This is the easiest and most reliable method. Any changes you push to GitHub will automatically deploy to Vercel.

### Step 1: Initialize Git and Push to GitHub
In your terminal, run:
```bash
git init
git add .
git commit -m "Initial commit - AI Receptionist MVP"
```
Create a new repository on [GitHub](https://github.com/new), then link and push:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in (or sign up with GitHub).
2. Click **Add New...** > **Project**.
3. Under **Import Git Repository**, find your repository and click **Import**.
4. In the configuration screen:
   - **Framework Preset**: Select `Vite` (or leave default).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `vite build` (preset automatically).
   - **Output Directory**: `dist` (preset automatically).
5. Under **Environment Variables**, expand the section and add your variables:
   - `WHATSAPP_PROVIDER`: `mock` (or `meta` if using official WhatsApp API)
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key
   - `WHATSAPP_PHONE_NUMBER_ID`: *(Optional)* Meta Phone Number ID
   - `WHATSAPP_API_TOKEN`: *(Optional)* Meta Permanent System User Access Token
   - `WHATSAPP_VERIFY_TOKEN`: *(Optional)* Webhook verification token (e.g. `ai_receptionist_verify_token_123`)
6. Click **Deploy**.

Within 1-2 minutes, Vercel will build and assign you a live HTTPS URL (e.g., `https://ai-receptionist-xyz.vercel.app`)!

---

## Method 2: Deploy directly via Vercel CLI

If you prefer deploying straight from your local terminal:

### Step 1: Install Vercel CLI (or run via npx)
```bash
npx vercel
```

### Step 2: Follow the Interactive Prompts
1. **Set up and deploy?**: Type `y` and press Enter.
2. **Which scope?**: Select your Vercel account.
3. **Link to existing project?**: Type `n`.
4. **Project name?**: Press Enter (defaults to `ai-receptionist`).
5. **In which directory is your code located?**: Press Enter (`./`).
6. **Want to modify build settings?**: Type `n`.

### Step 3: Deploy to Production
```bash
npx vercel --prod
```

---

## 🔒 Production Note on Data Storage

- **In Sandbox / Mock Mode**: Vercel serverless functions run statelessly. Data is initialized from the default business seed and stored in `/tmp/db.json` across function warm starts.
- **For Production Database**: When you're ready for multi-tenant production scale with millions of customer chats, you can swap the JSON store in `server/storage/db.js` with **Vercel Postgres**, **Supabase**, or **MongoDB Atlas** with a single database URL environment variable (`DATABASE_URL`).
