# GitHub Secrets Configuration Guide

To enable automated deployments to Firebase Hosting via GitHub Actions, you need to configure the following secrets in your GitHub repository.

---

## Required GitHub Secrets

| Secret Name | Description | Example / Value |
| :--- | :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT` | JSON key file for authentication with Firebase Hosting | `{"type": "service_account", ...}` |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `dashboard-n8n-32f5f.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `dashboard-n8n-32f5f` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `dashboard-n8n-32f5f.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging Sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123456789012:web:abcdef123456` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics Measurement ID | `G-XXXXXXXXXX` |

---

## Step 1: How to Get `FIREBASE_SERVICE_ACCOUNT`

### Option A: Via Firebase Console (Recommended)
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`dashboard-n8n-32f5f`**.
3. Click on the ⚙️ **Gear icon** next to *Project Overview* -> **Project settings**.
4. Navigate to the **Service accounts** tab.
5. Under *Firebase Admin SDK*, click **Generate new private key**.
6. Confirm by clicking **Generate key**. A `.json` file will be downloaded to your computer.
7. Open the downloaded `.json` file, copy its **entire content** (including opening `{` and closing `}`). This will be the value for `FIREBASE_SERVICE_ACCOUNT`.

### Option B: Via Firebase CLI
Run the following command in your local project root:
```bash
npx firebase-tools init hosting:github
```
Follow the interactive prompt to set up GitHub Actions authorization automatically.

---

## Step 2: How to Get `VITE_FIREBASE_*` Credentials

1. Go to **Firebase Console** -> **Project settings** (⚙️).
2. Scroll down to the **Your apps** section.
3. Select your Web App (or add one if not created yet).
4. Under **SDK setup and configuration**, select **Config**.
5. Copy the corresponding field values from the `firebaseConfig` object:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID` (Value: `dashboard-n8n-32f5f`)
   - `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`
   - `measurementId` → `VITE_FIREBASE_MEASUREMENT_ID`

---

## Step 3: Adding Secrets to GitHub

1. Open your repository on **GitHub**.
2. Click on **Settings** (top navigation tab of your repository).
3. In the left sidebar, expand **Secrets and variables** -> click **Actions**.
4. Click the green **New repository secret** button.
5. Enter the **Name** (e.g. `FIREBASE_SERVICE_ACCOUNT`) and paste the **Secret** value.
6. Click **Add secret**.
7. Repeat this process for all 8 secrets listed above.

---

## Testing the Workflow

Once secrets are added, push any code change to the `main` branch or manually trigger the workflow under the **Actions** tab on GitHub.
