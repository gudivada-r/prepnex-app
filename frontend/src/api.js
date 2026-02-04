import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Dynamic base URL
const getBaseUrl = () => {
    const origin = window.location.origin;
    const protocol = window.location.protocol;

    // Development Environment
    if (import.meta.env.MODE === 'development') {
        return 'http://localhost:8000';
    }

    // Native App (Robust Detection)
    if (Capacitor.isNativePlatform()) {
        return 'https://www.aumtech.ai';
    }

    // Native App (Capacitor/Ionic/File)
    // Check for "capacitor" protocol OR custom hostname defined in capacitor.config.json
    if (
        protocol === 'capacitor:' ||
        protocol === 'file:' ||
        window.location.hostname === 'app.studentsuccess.local'
    ) {
        return 'https://www.aumtech.ai';
    }

    // specific fix for localhost (development)
    if (origin.includes('localhost')) {
        return 'http://localhost:8000';
    }

    // Fallback for Standard Web App (Relative path)
    return '';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle 401 and 402
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 402) {
                // Subscription required - Dispatch event to be caught by UI
                window.dispatchEvent(new CustomEvent('subscription-required'));
            } else if (error.response.status === 401) {
                // Unauthorized - potential expired token
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
