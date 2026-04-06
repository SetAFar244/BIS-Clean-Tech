# 🚀 Brown's IT Solutions - Deployment Guide

This guide covers how to build and deploy the AI Receptionist (Miriam) and the Email Backend to Firebase.

## 📋 Prerequisites (First-Time Setup Only)
If you are deploying from a new computer, make sure you have the following installed:
1. **Node.js** (Download from nodejs.org)
2. **Firebase CLI**: Open your terminal and run:
   ```bash
   npm install -g firebase-tools
   ```
3. **Login to Firebase**: Run this command and log in with your Google account:
   ```bash
   firebase login
   ```

---

## 🔐 Step 1: Environment Variables
Before building, ensure your secret keys are in place. 
1. In the **root folder** of your project, ensure you have a file named exactly `.env`.
2. It must contain your active Gemini API key:
   ```env
   GEMINI_API_KEY="YOUR_ACTIVE_API_KEY_HERE"
   ```
*(Note: Never commit this file to public GitHub repositories).*

---

## ⚙️ Step 2: Build the Backend (Firebase Functions)
Whenever you make changes to the email logic or install new backend packages, you must rebuild the `functions` folder.

1. Open your terminal and navigate into the functions folder:
   ```bash
   cd functions
   ```
2. Install dependencies (only needed if you added new packages):
   ```bash
   npm install
   ```
3. Compile the TypeScript code into JavaScript:
   ```bash
   npm run build
   ```
4. Return to the main project folder:
   ```bash
   cd ..
   ```

---

## 🖥️ Step 3: Build the Frontend (React Website)
Whenever you make changes to the website's look, text, or Miriam's instructions, you must rebuild the frontend.

1. Ensure you are in the **root folder** of the project.
2. Install dependencies (only needed if you added new packages):
   ```bash
   npm install
   ```
3. Build the production-ready website (this "bakes" your `.env` key into the site):
   ```bash
   npm run build
   ```

---

## 🚀 Step 4: Deploy to Firebase
Once both the frontend and backend are built, you are ready to push everything live.

1. From the **root folder**, run:
   ```bash
   firebase deploy
   ```
2. Wait for the process to complete. Firebase will provide you with a **Hosting URL** where your live site is located.
3. **Hard Refresh** your live website in your browser (Ctrl+F5 or Cmd+Shift+R) to see the latest changes!

---

### 💡 Quick Deployment Shortcut
If you are actively working on the project and want to do Steps 2, 3, and 4 all at once, you can run this combined command from your root folder:

**Mac/Linux:**
```bash
cd functions && npm run build && cd .. && npm run build && firebase deploy
```

**Windows (Command Prompt):**
```cmd
cd functions & npm run build & cd .. & npm run build & firebase deploy
```
