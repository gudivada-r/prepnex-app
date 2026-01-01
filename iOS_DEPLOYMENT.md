# Quick Start: iOS Deployment

Your Student Success Navigator app is ready for cloud-based iOS deployment! 🚀

## What's Been Set Up

✅ **Codemagic CI/CD Pipeline** - Automated builds and TestFlight uploads  
✅ **Production Configuration** - Backend URL and iOS settings  
✅ **Build Scripts** - Convenient npm commands for iOS builds  
✅ **Complete Documentation** - Step-by-step deployment guide  

## Before You Deploy

### 1. Update Production Backend URL

Edit `frontend/capacitor.config.json`:
```json
"server": {
  "url": "https://studentsuccess-nu.vercel.app"  ← Change this
}
```

### 2. Apple Developer Account Setup

- [ ] Enroll at https://developer.apple.com/programs/ ($99/year)
- [ ] Create App ID: `com.studentsuccess.navigator`
- [ ] Generate App Store Connect API key

### 3. Codemagic Account

- [ ] Sign up at https://codemagic.io (500 free minutes/month)
- [ ] Connect your Git repository
- [ ] Add App Store Connect API credentials

## Deploy Now

📖 **Follow the comprehensive guide:**

```
.agent/workflows/deploy_ios.md
```

Or type `/deploy_ios` to view the workflow.

## Quick Commands

```bash
# Build for iOS locally (requires Mac with Xcode)
cd frontend
npm run build:ios

# Update iOS platform
npm run cap:update
```

## What Happens Next

1. **Push to main branch** → Codemagic builds automatically
2. **Build completes** (~15-20 min) → App uploads to TestFlight
3. **Test via TestFlight** → Install on iPhone/iPad
4. **Submit to App Store** → Goes live after Apple approval

## Need Help?

- 📖 Detailed Guide: `.agent/workflows/deploy_ios.md`
- 🔗 Codemagic: https://codemagic.io
- 🍎 App Store Connect: https://appstoreconnect.apple.com

---

**Cost**: $99/year Apple Developer + Free Codemagic tier (500 min/month)
