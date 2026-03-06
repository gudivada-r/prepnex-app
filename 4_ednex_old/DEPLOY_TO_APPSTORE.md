# Deploying Student Success Navigator to the App Store

This guide explains how to package and release the iOS version of the application.

## Prerequisites

1.  **Mac Computer**: You must have a Mac to build iOS apps.
2.  **Xcode**: Install [Xcode](https://developer.apple.com/xcode/) from the Mac App Store.
3.  **Apple Developer Account**: You need an active enrollment in the [Apple Developer Program](https://developer.apple.com/).

## Steps to Deploy

### 1. Prepare the Codebase (On your Machine)
Ensure all your latest changes are built and synced to the iOS project folder.

```bash
cd frontend
npm run mobile:sync
```

This command builds the React web app and copies the assets into the `ios/` native project folder.

### 2. Open Xcode
Open the project in Xcode using the following command (must be on a Mac):

```bash
cd frontend
npm run mobile:open
```

Or manually open `frontend/ios/App/App.xcworkspace`.

### 3. Configure Signing
1.  In Xcode, click on the **App** project in the left navigator.
2.  Select the **App** target.
3.  Go to the **Signing & Capabilities** tab.
4.  Check **Automatically manage signing**.
5.  Select your **Team** (your Apple Developer account).
6.  Ensure the **Bundle Identifier** is set to `com.studentsuccess.navigator` (or update it to match your Apple Developer provisioning profile).

### 4. Test on Simulator
1.  Select a target device (e.g., iPhone 15) from the top toolbar.
2.  Click the **Play/Run** button (▶️).
3.  Verify the app launches and functions correctly.

### 5. Create an App Store Build
1.  In the top toolbar, select **Any iOS Device (arm64)** as the target.
2.  Go to **Product > Archive**.
3.  Xcode will build the app. This may take a few minutes.
4.  Once finished, the **Organizer** window will open showing your new archive.

### 6. Upload to App Store Connect
1.  In the Organizer window, select your archive and click **Distribute App**.
2.  Select **App Store Connect** -> **Upload**.
3.  Follow the prompts to validate and upload your build.
4.  Once uploaded, go to [App Store Connect](https://appstoreconnect.apple.com/).
5.  Select your app, go to **TestFlight** to invite testers, or **App Store** to submit for review.

## Troubleshooting

*   **CocoaPods Errors**: If you encounter issues with dependencies, try running `cd ios/App && pod install` on your Mac.
*   **Assets Not Updating**: Make sure you ran `npm run mobile:sync` *before* opening Xcode.

## For Windows Users

Directly building iOS apps (`.ipa` files) or uploading to the App Store is **not possible on Windows** because Xcode is required. However, you can use **GitHub Actions** (Cloud Build) to perform the build for you.

### How to use the Cloud Build
We have included a GitHub Action workflow (`.github/workflows/ios-build.yml`) that runs on a virtual Mac.

1.  **Commit and Push** your changes to GitHub.
2.  Go to the **Actions** tab in your GitHub repository.
3.  Select the **Build iOS App** workflow.
4.  This will verify your code builds correctly on iOS.

### To release to App Store from Windows:
You must configure **Code Signing** in the GitHub Action. This requires:
1.  An Apple Developer Account.
2.  Exporting your `Distribution Certificate (.p12)` and `Provisioning Profile` (this typically requires access to a Mac at least once, or correct use of OpenSSL).
3.  Adding these as **Secrets** in your GitHub Repository settings.
4.  Updating the workflow to use `fastlane` or `xcodebuild` with signing enabled.

**Alternative**: Use a service like **Bitrise**, **Codemagic**, or **Ionic Appflow**, which specialize in building iOS apps from the cloud for Windows developers.
