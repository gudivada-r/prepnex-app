import axios from 'axios';

// Hardcoded for stability on Vercel
const api = axios.create({
    baseURL: 'https://studentsuccess-nu.vercel.app',
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
