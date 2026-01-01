---
description: How to deploy the iOS app to the Apple App Store using Codemagic
---

# Deploy iOS App to App Store Using Codemagic

This workflow guides you through deploying the Student Success Navigator iOS app to the Apple App Store using Codemagic cloud build service from Windows (no Mac required).

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Apple Developer Account** ($99/year)
  - Enrolled in [Apple Developer Program](https://developer.apple.com/programs/)
  - Access to [App Store Connect](https://appstoreconnect.apple.com/)
  
- [ ] **Codemagic Account**
  - Sign up at [codemagic.io](https://codemagic.io)
  - Free tier: 500 build minutes/month
  
- [ ] **Git Repository**
  - Code pushed to GitHub, GitLab, or Bitbucket
  - `codemagic.yaml` file in repository root
  
- [ ] **Production Backend**
  - Backend API deployed and accessible
  - Update `capacitor.config.json` with production URL

---

## Part 1: Apple Developer Setup (One-Time)

### Step 1: Create App ID

1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **App IDs** → **App**
5. Configure:
   - **Description**: Student Success Navigator
   - **Bundle ID**: `com.studentsuccess.navigator` (must match capacitor.config.json)
   - **Capabilities**: Enable any needed (Push Notifications, App Groups, etc.)
6. Click **Continue** → **Register**

### Step 2: Create App Store Connect Record

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Student Success Navigator
   - **Primary Language**: English
   - **Bundle ID**: Select `com.studentsuccess.navigator`
   - **SKU**: `student-success-navigator-001`
   - **User Access**: Full Access
4. Click **Create**

### Step 3: Generate App Store Connect API Key

1. In App Store Connect, go to **Users and Access** → **Keys** tab
2. Click **+** to generate new key
3. Configure:
   - **Name**: Codemagic CI/CD
   - **Access**: App Manager (or Developer if limited)
4. Click **Generate**
5. **IMPORTANT**: Download the `.p8` file immediately (you can't download it again)
6. Note these values (you'll need them):
   - **Issuer ID** (top of page)
   - **Key ID** (in the key row)
   - **Private Key** (contents of the downloaded `.p8` file)

---

## Part 2: Codemagic Setup (One-Time)

### Step 1: Connect Repository

1. Sign in to [codemagic.io](https://codemagic.io)
2. Click **Add application**
3. Select your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize Codemagic to access your repository
5. Select the **Student Success Navigator** repository
6. Choose **Flutter/Capacitor** as project type (or detect automatically)
7. Click **Finish: Add application**

### Step 2: Configure App Store Connect Integration

1. In Codemagic, open your app
2. Go to **Settings** → **Integrations** → **App Store Connect**
3. Click **Enable App Store Connect**
4. Enter the values from Part 1, Step 3:
   - **Issuer ID**: Paste your issuer ID
   - **Key ID**: Paste your key ID
   - **Private Key**: Paste the entire contents of the `.p8` file
5. Click **Save**

### Step 3: Configure Code Signing (Automatic)

Codemagic can automatically manage certificates and provisioning profiles:

1. In your app settings, go to **Distribution** → **iOS code signing**
2. Select **Automatic code signing**
3. Choose **App Store** distribution type
4. Bundle ID: Should auto-detect `com.studentsuccess.navigator`
5. Click **Fetch certificates and profiles**
6. Codemagic will automatically:
   - Create distribution certificate (if needed)
   - Create App Store provisioning profile (if needed)
   - Store them securely encrypted

### Step 4: Add Environment Variables

1. Go to **Settings** → **Environment variables**
2. Add your email for notifications:
   ```
   Variable name: NOTIFICATION_EMAIL
   Value: your-email@example.com
   Secure: No
   ```
3. Add backend URL (if not in capacitor.config.json):
   ```
   Variable name: BACKEND_API_URL
   Value: https://your-backend-api.vercel.app
   Secure: No
   ```

---

## Part 3: First Deployment

### Step 1: Verify Configuration Files

Ensure these files are committed to your repository:

1. **codemagic.yaml** (project root)
   - Contains build pipeline configuration
   - Encrypted secrets configured in Codemagic UI

2. **capacitor.config.json** (frontend/)
   - Update production backend URL:
   ```json
   "server": {
     "url": "https://your-actual-backend.vercel.app"
   }
   ```

3. **Info.plist** (frontend/ios/App/App/)
   - Version: 1.0.0
   - Build: 1 (will auto-increment)

### Step 2: Update Backend URL

// turbo
```bash
# Navigate to frontend folder
cd c:\Projects\AA\SS_12_26\frontend

# Open capacitor.config.json and update the server.url to your production backend
```

### Step 3: Commit and Push

// turbo
```bash
# Commit all changes
cd c:\Projects\AA\SS_12_26
git add .
git commit -m "Configure iOS deployment with Codemagic"
git push origin main
```

### Step 4: Trigger Build in Codemagic

1. In Codemagic dashboard, select your app
2. Go to **Builds** tab
3. Click **Start new build**
4. Select:
   - **Workflow**: `ios-release`
   - **Branch**: `main`
5. Click **Start new build**

### Step 5: Monitor Build Progress

1. Watch the live build log in Codemagic dashboard
2. Build steps (typical duration: 15-20 minutes):
   - ✓ Clone repository (~30s)
   - ✓ Install npm dependencies (~2-3 min)
   - ✓ Build web assets (~1-2 min)
   - ✓ Sync Capacitor (~30s)
   - ✓ Install CocoaPods (~2-3 min)
   - ✓ Build iOS app (~8-10 min)
   - ✓ Upload to App Store Connect (~1-2 min)

3. If build succeeds:
   - ✅ Green checkmark appears
   - 📦 `.ipa` file available in Artifacts
   - 📧 Email notification sent
   - 🚀 App uploaded to TestFlight

### Step 6: Test with TestFlight

1. Open [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Go to **My Apps** → **Student Success Navigator**
3. Click **TestFlight** tab
4. Under **iOS Builds**, you should see your build processing
5. Wait for processing (~5-15 minutes)
6. Once "Ready to Test":
   - Add internal testers (your Apple ID email)
   - Install **TestFlight** app on iPhone/iPad
   - Accept invitation and install app
   - Test core functionality

---

## Part 4: Submit to App Store

### Step 1: Complete App Information

In App Store Connect, complete all required metadata:

1. **App Information**
   - Subtitle, Category, Content Rights

2. **Pricing and Availability**
   - Free or Paid
   - Available Countries

3. **App Privacy**
   - Privacy Policy URL
   - Data Collection practices

4. **Screenshots** (Required for each device size)
   - iPhone 6.7" Display (iPhone 14 Pro Max)
   - iPhone 6.5" Display (iPhone 11 Pro Max)
   - iPad Pro (12.9" 3rd gen)
   
   Use iOS Simulator or actual devices to capture screenshots

5. **App Description**
   - Compelling description highlighting features
   - Keywords for search optimization

6. **App Review Information**
   - Demo account credentials for reviewers
   - Contact information

### Step 2: Select Build

1. Under **App Store** tab → **iOS App**
2. Click **+ Version or Platform** (if first release)
3. Enter version: `1.0.0`
4. Under **Build**, click **Select a build before you submit**
5. Choose the build uploaded from Codemagic
6. Click **Done**

### Step 3: Submit for Review

1. Verify all sections have green checkmarks
2. Click **Add for Review**
3. Answer export compliance questions
4. Click **Submit to App Review**

### Step 4: Review Process

- **In Review**: Apple is reviewing (1-3 days typically)
- **Rejected**: Address feedback and resubmit
- **Pending Release**: Approved, ready to publish
- **Ready for Sale**: Live in App Store! 🎉

---

## Continuous Updates

### For Subsequent Releases:

1. **Update version number** in `Info.plist`:
   ```xml
   <key>CFBundleShortVersionString</key>
   <string>1.1.0</string>
   ```

2. **Commit and push** to `main` branch:
   ```bash
   git add .
   git commit -m "Release v1.1.0 - New features..."
   git push origin main
   ```

3. **Automatic build** triggers in Codemagic

4. **TestFlight** receives update automatically

5. **Submit new version** in App Store Connect when ready

---

## Troubleshooting

### Build Fails: Code Signing Error

**Problem**: "No matching provisioning profile found"

**Solution**:
1. In Codemagic, go to **iOS code signing**
2. Click **Revoke certificates**
3. Click **Fetch certificates and profiles** again
4. Retry build

### Build Fails: Pod Install Error

**Problem**: CocoaPods dependencies fail to install

**Solution**:
1. Check `Podfile` in `frontend/ios/App/`
2. Update pod versions if needed
3. In `codemagic.yaml`, try:
   ```yaml
   - pod repo update
   - pod install --repo-update
   ```

### App Crashes on Launch

**Problem**: App installed via TestFlight crashes immediately

**Solution**:
1. Check backend URL in `capacitor.config.json`
2. Verify backend is accessible (not localhost)
3. Check Xcode console logs for errors
4. Ensure all Capacitor plugins are compatible with iOS version

### Upload to App Store Fails

**Problem**: "Asset validation failed"

**Solution**:
1. Verify bundle identifier matches App Store Connect
2. Check icon and screenshot sizes meet requirements
3. Ensure version number is incremented
4. Review detailed error in Codemagic logs

### TestFlight Shows "Processing" Forever

**Problem**: Build stuck processing for hours

**Solution**:
1. Check email for rejection notice from Apple
2. Common issues:
   - Missing export compliance
   - Invalid app icon
   - Unsupported architectures
3. Contact Apple Developer Support if > 24 hours

---

## Security Best Practices

### Secrets Management

✅ **DO**:
- Store all secrets in Codemagic Environment Variables (encrypted)
- Use separate API keys for production vs. development
- Rotate App Store Connect API keys annually

❌ **DON'T**:
- Commit `.p8` files or certificates to Git
- Share App Store Connect credentials
- Use same API keys across multiple services

### Code Signing

✅ **DO**:
- Use automatic code signing in Codemagic
- Keep certificates encrypted in Codemagic
- Revoke old certificates when creating new ones

❌ **DON'T**:
- Download and share certificate files manually
- Reuse development certificates for distribution

---

## Cost Summary

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Apple Developer** | N/A | $99/year (required) |
| **Codemagic** | 500 min/month | $199/month unlimited |
| **Backend Hosting** | Varies | Based on your provider |

**Typical monthly cost for indie developer**: ~$8 (Apple $99/year = $8.25/month)

**Tips to stay in free tier**:
- Only trigger builds on `main` branch
- Use development workflow for testing
- Optimize build scripts to reduce time

---

## Quick Reference

### Useful Commands

```bash
# Local iOS build (requires Mac)
npm run build:ios

# Open Xcode project
npm run mobile:open:ios

# Update Capacitor iOS platform
npm run cap:update

# Manual Capacitor sync
npx cap sync ios
```

### Important URLs

- **Codemagic Dashboard**: https://codemagic.io/apps
- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer**: https://developer.apple.com/account
- **TestFlight**: https://testflight.apple.com

### Support Resources

- Codemagic Docs: https://docs.codemagic.io/
- Capacitor iOS Docs: https://capacitorjs.com/docs/ios
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

---

**Questions or issues?** Check Codemagic build logs first, then review troubleshooting section above.
