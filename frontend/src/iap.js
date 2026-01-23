import { Capacitor } from '@capacitor/core';

let Purchases = null;

// Mock Data for Web
const MOCK_OFFERINGS = {
    current: {
        availablePackages: [
            {
                identifier: '$rc_monthly',
                packageType: 'MONTHLY',
                product: {
                    identifier: 'price_premium_monthly',
                    description: 'Unlock Full Access',
                    title: 'Premium Monthly',
                    price: 9.99,
                    priceString: '$9.99',
                    currencyCode: 'USD',
                },
                offeringIdentifier: 'default'
            }
        ]
    }
};

const MOCK_CUSTOMER_INFO = {
    entitlements: {
        active: {
            'premium': {
                identifier: 'premium',
                isActive: true,
                willRenew: true,
                periodType: 'NORMAL',
                latestPurchaseDate: new Date().toISOString(),
                originalPurchaseDate: new Date().toISOString(),
                expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                store: 'WEB_MOCK'
            }
        }
    },
    activeSubscriptions: ['price_premium_monthly'],
    allExpirationDates: {},
    allPurchaseDates: {},
    allPurchasedProductIdentifiers: [],
    firstSeen: new Date().toISOString(),
    originalAppUserId: 'mock-user-id',
    requestDate: new Date().toISOString(),
    managementURL: null,
    originalPurchaseDate: new Date().toISOString(),
    nonSubscriptionTransactions: [],
};

const API_KEY = "appl_uhitnXmAVGjaBgGgeolgvaTNffP";
let isConfigured = false;

const loadRevenueCat = async () => {
    // Check if we are Native
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
        if (Purchases) return Purchases;
        try {
            const module = await import('@revenuecat/purchases-capacitor');
            Purchases = module.Purchases;
            return Purchases;
        } catch (e) {
            console.error("Error loading RevenueCat SDK", e);
            return null;
        }
    }

    // Return "Mock" object for Web
    return {
        isMock: true
    };
};

export const initializeIAP = async () => {
    if (isConfigured) return;

    const p = await loadRevenueCat();
    if (p && !p.isMock) {
        try {
            await p.configure({ apiKey: API_KEY });
            isConfigured = true;
            console.log("RevenueCat configured successfully");
        } catch (e) {
            console.error("RevenueCat configuration failed", e);
        }
    } else {
        isConfigured = true;
        console.log("RevenueCat (Web Mock) Initialized");
    }
};

export const getRevenueCatOfferings = async () => {
    // Safety Check: Ensure SDK is configured before fetching
    if (!isConfigured) {
        console.log("RevenueCat not configured yet, initializing now...");
        await initializeIAP();
    }

    const p = await loadRevenueCat();
    if (p) {
        if (p.isMock) {
            // Simulate network delay
            await new Promise(r => setTimeout(r, 500));
            return MOCK_OFFERINGS;
        }
        try {
            return await p.getOfferings();
        } catch (e) {
            console.error("Error getting offerings", e);
        }
    }
    return null;
};

export const purchaseRevenueCatPackage = async (pkg) => {
    const p = await loadRevenueCat();
    if (p) {
        if (p.isMock) {
            await new Promise(r => setTimeout(r, 1000));
            return { customerInfo: MOCK_CUSTOMER_INFO };
        }
        return await p.purchasePackage(pkg);
    }
    throw new Error("RevenueCat not initialized or not supported");
};

export const restorePurchases = async () => {
    const p = await loadRevenueCat();
    if (p) {
        if (p.isMock) {
            await new Promise(r => setTimeout(r, 800));
            return { customerInfo: MOCK_CUSTOMER_INFO };
        }
        return await p.restorePurchases();
    }
    throw new Error("RevenueCat not initialized");
}
