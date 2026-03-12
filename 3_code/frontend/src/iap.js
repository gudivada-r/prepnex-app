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
    // IAP functionality disabled as app is now free.
    isConfigured = true;
    console.log("IAP Initialization: App is in Free/University License mode.");
};

export const getRevenueCatOfferings = async () => {
    // App is free, no offerings to display.
    return {
        current: {
            availablePackages: []
        }
    };
};

export const purchaseRevenueCatPackage = async (pkg) => {
    return { customerInfo: MOCK_CUSTOMER_INFO };
};

export const restorePurchases = async () => {
    return { customerInfo: MOCK_CUSTOMER_INFO };
};
