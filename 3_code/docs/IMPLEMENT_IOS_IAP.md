# Implementing Apple In-App Purchases (IAP) for iOS

This guide outlines the step-by-step process to implement native iOS In-App Purchases using the RevenueCat SDK (recommended for Capacitor apps). This is required to satisfy Apple App Store Guideline 3.1.1.

## Phase 1: Apple Administrative Work
**Goal**: Configure the products in Apple's system so they can be sold.

1.  **Sign Paid Apps Agreement**
    *   Log in to [App Store Connect](https://appstoreconnect.apple.com).
    *   Navigate to **Business**.
    *   Review and sign the "Paid Applications Agreement".
    *   Enter your tax and banking information. *Note: IAP testing often fails until this is active.*

2.  **Create Subscription Group & Products**
    *   Navigate to **My Apps** > Select your App.
    *   In the sidebar, find **Monetization** > **Subscriptions**.
    *   Click **Create** to make a "Subscription Group" (e.g., call it "Premium Access").
    *   Inside the group, create a **Product**:
        *   **Reference Name**: `Success Pass Monthly` (Internal use only)
        *   **Product ID**: `com.studentsuccess.premium_monthly` (Save this ID!)
        *   **Duration**: `1 Month`
        *   **Price**: `$9.99` (or your choice)
    *   Add Localization: Give it a display name (e.g., "Success Pass") and description.

3.  **Create Sandbox Testers**
    *   Navigate to **Users and Access** > **Sandbox Testers**.
    *   Click **(+)** to create a test account.
    *   Use a real email address (can be a `+alias` like `me+test1@gmail.com`) but do **NOT** use an existing Apple ID.
    *   Set a password you will remember (e.g., `Password123!`).

---

## Phase 2: Client Implementation (Frontend)
**Goal**: Update the App to use RevenueCat to fetch and buy products.

### 1. Set up RevenueCat
1.  Go to [RevenueCat](https://www.revenuecat.com/) and create a free account.
2.  Create a new Project -> Add an iOS App.
3.  Enter your Bundle ID (`com.studentsuccess.app`?) and App Store Connect Shared Secret (Found in App Store Connect > Users and Access > Shared Secret).
4.  **Create an Offering**:
    *   In RevenueCat Dashboard, go to **Products**. Import your Apple Product ID (`com.studentsuccess.premium_monthly`).
    *   Go to **Offerings** > Create Default Offering.
    *   Add a "Monthly" package and attach your product.

### 2. Install SDK
Run these commands in your project root:
```bash
npm install @revenuecat/purchases-capacitor
npx cap sync
```

### 3. Initialize SDK
In `frontend/src/App.jsx` (or `main.jsx`), initialize the SDK early:

```javascript
import { Purchases } from '@revenuecat/purchases-capacitor';

const onAppStart = async () => {
    if (Capacitor.getPlatform() === 'ios') {
        try {
            // Get this key from RevenueCat Dashboard > API Keys
            await Purchases.configure({ apiKey: "appl_YOUR_PUBLIC_KEY" }); 
        } catch (e) { 
            console.error("IAP Init Failed", e); 
        }
    }
}
// Call onAppStart() in a useEffect
```

### 4. Build the Paywall
Update `frontend/src/components/Subscription.jsx` to fetch real data:

```javascript
import { Purchases } from '@revenuecat/purchases-capacitor';

// Inside component...
const [packages, setPackages] = useState([]);

useEffect(() => {
    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current) {
                setPackages(offerings.current.availablePackages);
            }
        } catch (e) {
             console.error("Error fetching offers", e);
        }
    }
    loadOfferings();
}, []);

const buyPackage = async (pkg) => {
    try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        if (customerInfo.entitlements.active['premium']) { // 'premium' is the Entitlement ID set in RevenueCat
            alert("Welcome to Premium!");
            // Unlock app features
        }
    } catch (e) {
        if (!e.userCancelled) {
            alert("Error purchasing: " + e.message);
        }
    }
}
```

---

## Phase 3: Backend Synchronization (Optional but Recommended)
**Goal**: Keep your Postgres database in sync so the user's "subscription_status" is accurate across web and mobile.

1.  **Setup Webhook**
    *   In RevenueCat Dashboard > Project Settings > Integrations > Webhooks.
    *   Point it to: `https://your-api-url.com/api/webhooks/revenuecat`.
    *   Add header: `x-api-key: YOUR_INTERNAL_SECRET`.

2.  **Handle Webhook**
    *   In `backend/app/api.py`, add a route to handle the POST.
    *   Look for `event['type']` -> `INITIAL_PURCHASE` or `RENEWAL`.
    *   Extract the `app_user_id` (User ID) and update your database:
        ```python
        user = session.get(User, event['app_user_id'])
        user.subscription_status = 'active'
        session.commit()
        ```

---

## Phase 4: Testing & Submission
**Goal**: Verify it works and submit to Apple.

1.  **Test on Real Device**
    *   Deploy the app to your iPhone.
    *   Go to iOS Settings > App Store > **Sandbox Account**.
    *   Sign in with the Tester account created in Phase 1.
    *   Open App -> Go to Subscription Page -> Buy.
    *   Confirm the "You are all set" Apple system dialog appears.

2.  **Submit for Review**
    *   In App Store Connect > **Prepare for Submission**.
    *   Scroll down to **In-App Purchases**.
    *   Select the `Success Pass Monthly` product to include it in the review.
    *   **Crucial**: In "Review Notes", tell the reviewer: "This is a new IAP implementation. A test account is provided: [email] / [password]".

---
