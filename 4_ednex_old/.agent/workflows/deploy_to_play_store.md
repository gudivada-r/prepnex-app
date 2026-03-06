---
description: How to build and deploy the Android App to the Google Play Store
---

# Deploying to Google Play Store

This guide outlines the steps to take the configured Capacitor Android project and deploy it to the Google Play Store.

## Prerequisites
1.  **Google Play Developer Account**: You must have a paid developer account ($25 one-time fee) at [play.google.com/console](https://play.google.com/console).
2.  **Android Studio**: Ensure you have Android Studio installed to build the signed app bundle.

## Step 1: Sync & Update
Before building, ensure your latest frontend code is synced to the native Android project.

```powershell
cd frontend
npm run mobile:sync
```

## Step 2: Open in Android Studio
Open the native project in Android Studio.

```powershell
npm run mobile:open:android
```
*Alternatively, launch Android Studio manually and open the `frontend/android` folder.*

## Step 3: Configure App Identity (One-time)
1.  In Android Studio, open `app/build.gradle`.
2.  Update `applicationId` to your unique package name (e.g., `com.studentstart.navigator`).
3.  Sync Gradle files (Elephant icon in top right).

## Step 4: Generate Signed App Bundle
Google Play requires an Android App Bundle (.aab) signed with a secure key.
1.  In Android Studio menu: **Build > Generate Signed Bundle / APK**.
2.  Select **Android App Bundle**.
3.  **Key Store Path**: Create a new key store if you don't have one.
    *   **Keep this file safe!** If you lose it, you cannot update your app.
4.  Fill in the passwords and certificate details.
5.  Select **Release** build variant.
6.  Click **Finish**.

## Step 5: Upload to Play Console
1.  Go to [Google Play Console](https://play.google.com/console).
2.  **Create App**: Enter app name, language, and "App" type.
3.  **Testing**: It is recommended to start with **Internal Testing**.
    *   Select "Internal testing" from the sidebar.
    *   "Create new release".
    *   Upload the `.aab` file generated in Step 4 (usually found in `frontend/android/app/release/`).
4.  **Store Listing**: Complete the store listing (Screenshots, Description, Icon).
    *   *Tip: Use the AI Agent to generate promotional images!*
5.  **Review**: Submit the release for review.

## Troubleshooting
*   **Version Codes**: Every new upload must have a higher `versionCode` in `app/build.gradle`.
*   **Permissions**: If you need Camera or Location, ensure they are requested in `AndroidManifest.xml`.
