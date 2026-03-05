# How to Get Your RevenueCat API Key

Follow these exact steps to get the API Key needed for the code.

## 1. Create a RevenueCat Account
1. Go to [RevenueCat.com](https://www.revenuecat.com/).
2. Click **Sign Up** and create a free account.

## 2. Create a Project
1. In the dashboard, click **Create New Project**.
2. Name it something like "Student Success Navigator".

## 3. Add Your iOS App
1. Inside the project, click **Add App** on the right side.
2. Select **App Store** (Apple).
3. **App Name**: Enter "Student Success Navigator".
4. **App Bundle ID**: This MUST match your code.
   - Access your `capacitor.config.ts` or `capacitor.config.json` to confirm. 
   - Based on our files, it is likely: `com.studentsuccess.app` (Please verify!)
5. **App Store Connect Shared Secret**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com/).
   - Click **My Apps** -> Select your app.
   - Go to **App Information** (General section) or **Subscriptions** -> **App Store Shared Secret**.
   - Generate a Shared Secret and paste it into RevenueCat.
   - *Note: If you don't have the secret handy yet, you can often skip this step initially or add it later, but IAP verification won't work without it.*
6. Click **Save Changes**.

## 4. Get the Public API Key
1. Once the app is added, go to the **Project Settings** (gear icon in the left sidebar) -> **API Keys**.
2. Look for the section **Public API Keys**.
3. You should see a key starting with `appl_` (e.g., `appl_AbCdEfGhIjKlMnOpQrStUvWxYz`).
4. **Copy this key.**

## 5. Configure Offerings (Crucial for the Code to Work)
The code uses `Purchases.getOfferings()` to dynamically fetch products. If this is empty, the paywall will be blank.

1. **Entitlements**:
   - Go to **Entitlements** in the sidebar.
   - Click **New**. Identifier: `premium` (This EXACT text is used in the code).
   - Description: "Full Access".
   - Click **Add**.

2. **Products**:
   - Go to **Products**.
   - Click **New**.
   - **Identifier**: This must MATCH the Product ID you created in Apple App Store Connect (e.g., `com.studentsuccess.premium_monthly`).
   - Select the App Store app you just added.
   - Click **Add**.

3. **Offerings**:
   - Go to **Offerings**.
   - Ideally, there is a "Default" offering. If not, click **New** -> Identifier: `default`.
   - Click on the `default` offering.
   - Click **New Package**.
   - Identifier: `monthly`.
   - Description: "Monthly Subscription".
   - Attach the **Product** you created in step 2.
   - Attach the **Entitlement** (`premium`) to that product if asked (or it links automatically via the product).

## 6. Handover
Once you have the **Public API Key** (starts with `appl_`), provide it to me or paste it into `frontend/src/App.jsx` where indicated.
