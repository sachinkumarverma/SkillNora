import axios from 'axios';
import supabase from '@/lib/supabaseClient';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(async (config) => {
    if (!config.headers.Authorization) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    }
    return config;
}, (error) => Promise.reject(error));

export default apiClient;
