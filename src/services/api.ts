import axios from 'axios';

// Get the base URL from env
const BASE_ENV_URL = import.meta.env.VITE_API_BASE_URL || 'https://idibia-backend-main-wjhaop.laravel.cloud/api';

// Auto-upgrade to HTTPS if the current page is HTTPS to prevent Mixed Content errors
export const API_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' && BASE_ENV_URL.startsWith('http:')
    ? BASE_ENV_URL.replace('http:', 'https:') // Upgrade to HTTPS
    : BASE_ENV_URL;

export const WEB_URL = API_URL.replace(/\/api\/?$/, ''); // Strip /api to get root URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Add request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Optional: Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

export default api;
