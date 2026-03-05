# Fixing Apple Rejection 3.1.1 - In-App Purchase Availability

Apple rejected the app because they found that users can access premium content (likely via login/subscription) but **cannot purchase that subscription within the app using Apple's In-App Purchase (IAP)**.

This usually happens for one of two reasons:
1.  **Technical Failure**: The IAP products failed to load during the review (the "Upgrade" button probably said "Store Unavailable").
2.  **Configuration Error**: The IAP products weren't submitted *with* the app binary in App Store Connect.

Follow this checklist to fix it.

## 1. Verify Bundle IDs Match
Your code uses the Bundle ID: **`com.studentsuccess.navigator`** (found in `capacitor.config.json`).
*   **App Store Connect**: Ensure your App ID is `com.studentsuccess.navigator`.
*   **RevenueCat**: Ensure the iOS App in your project is set to `com.studentsuccess.navigator`.
    *   *Note: Previous docs mentioned `com.studentsuccess.app` - ensure you aren't using that one by mistake!*

## 2. Verify RevenueCat Configuration
1.  Go to the [RevenueCat Dashboard](https://app.revenuecat.com/).
2.  Go to **API Keys** and check the "Public SDK Key" for iOS.
    *   Compare it with `frontend/src/iap.js` line 53: `appl_uhitnXmAVGjaBgGgeolgvaTNffP`.
    *   If they differ, update `iap.js`.
3.  Go to **Offerings**.
    *   Ensure there is a "Default" offering.
    *   Ensure it contains a Package (e.g., "Monthly").
    *   Ensure that Package is attached to an **Apple Product** (e.g., `com.studentsuccess.navigator.monthly` - or whatever ID you created in Apple).

## 3. Verify Apple App Store Connect
**This is the most common cause of failure.**

1.  **Agreements**: Go to **Business** (or "Agreements, Tax, and Banking"). Ensure the "Paid Apps" agreement is **Active**. (If it says "New" or "Terms Pending", IAP will fail).
2.  **Products**:
    *   Go to **Monetization** > **Subscriptions**.
    *   Ensure your Product Status is "Ready to Submit" or "Missing Metadata" (it should not be "Rejected").
    *   Take note of the exact **Product ID**. Does it match what is inside RevenueCat?

## 4. The Critical Submission Step**
When you resubmit the app, you MUST attach the items to the review.

1.  In App Store Connect, go to your **Resubmit** (or prepare for submission) page.
2.  Scroll down to the **In-App Purchases** or **Subscriptions** section.
3.  You should see a button like `(+) Add In-App Purchases`.
4.  **Select your Subscription Product**.
5.  If you do not do this, the IAP will stay in "Ready to Submit" state and will **fail to load** for the reviewer.
6.  Once attached, the product status will likely change to asking for review or "Pending Developer Release" upon approval.

## 5. Test Before Resubmitting using TestFlight
Do not just guess. Verify it works on a real device.

1.  Push a new build to **TestFlight**.
2.  Install it on your real iPhone.
3.  Go to the Subscription page.
    *   **Does it show the price?** (e.g. "$9.99/mo" instead of "Store Unavailable").
    *   **Can you tap "Upgrade"?**
    *   **Does the Apple Buy sheet appear?**
4.  If "Store Unavailable" appears in TestFlight, it will definitely fail Review. Fix the configuration (Steps 1-3) until TestFlight works.

## Summary of Fix
1.  Confirm Bundle ID `com.studentsuccess.navigator` is used everywhere.
2.  Confirm RevenueCat keys and Offerings are linked.
3.  **Attach the Subscription Product** to the submission in App Store Connect.
