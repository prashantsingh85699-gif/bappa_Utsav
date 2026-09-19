# 🪔 Bappa Utsav — Deployment & Hosting Guide

Bappa Utsav is a modern, festival-grade web game built with **React**, **Vite**, **TypeScript**, and the **Web Audio API**. It is completely static-hosting friendly and can be deployed in less than 2 minutes on free, high-performance platforms.

---

## 🚀 Option 1: Deploy to Vercel (Recommended — Fastest & Free)

Vercel provides automatic HTTPS, worldwide edge CDN, and automatic continuous deployment on every Git push.

### Steps:
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New Project"** -> **"Import Git Repository"**.
3. Select your repository: **`prashantsingh85699-gif/bappa_Utsav`**.
4. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. *(Optional)* If using Firebase for global cross-device cloud leaderboards, add your Environment Variables (see below). If not using Firebase, leave them blank — the game will automatically use its built-in offline-first verified vault!
6. Click **"Deploy"**.
7. In ~45 seconds, your live game URL (e.g. `https://bappa-utsav.vercel.app`) will be active! 🎉

---

## 🌐 Option 2: Deploy to Netlify

1. Go to [https://netlify.com](https://netlify.com) and sign in.
2. Click **"Add new site"** -> **"Import an existing project"** -> **GitHub**.
3. Authorize and choose **`prashantsingh85699-gif/bappa_Utsav`**.
4. Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**.

---

## 🔥 Option 3: Deploy to Firebase Hosting (Optional)

If you already have a Firebase project with Firestore:
1. Install Firebase CLI globally (if not installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Select your existing Firebase project.
   - Set public directory to: `dist`
   - Configure as a single-page app (rewrite all urls to `/index.html`): `Yes`
   - Set up automatic builds and deploys with GitHub? `No` (or Yes if desired).
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## ⚙️ Environment Variables (Firebase Configuration)

The game works **100% out of the box** without any environment variables (using high-performance LocalStorage with verified player credentials). 

To enable Firebase Cloud Leaderboards and Firebase Auth, create a `.env` file (or set them in your Vercel / Netlify dashboard):

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🛡️ Controlling the Leaderboard

1. **Verified Devotees Mode**:
   - By default, the game only displays **Verified Devotees** on the Official Leaderboard.
   - Players click **"Verify"** on the top header or Home screen to create a Devotee Account with a username/email and passcode.
2. **Purge Demo / Mock Users**:
   - Open the Leaderboard screen.
   - Click the **Sliders/Controls icon** (⚙️) on the top right.
   - Click **"Purge Mock / Demo Users"** to permanently remove any sample devotees before publishing.
   - Click **"Full Reset for Launch"** if you want to wipe all local test scores to start fresh on launch day!
