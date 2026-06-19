import apiClient from '@/lib/apiClient';
import supabase from '@/lib/supabaseClient';

export const authService = {
    signUp: async (email: string, password: string,role: string) => {
        return await supabase.auth.signUp({ 
            email, 
            password, 
            options: { 
                emailRedirectTo: `${window.location.origin}/dashboard`,
                data: { role } 
            } 
        });
    },
    signInWithPassword: async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password });
    },
    signInWithOtp: async (email: string) => {
        return await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    },
    resetPasswordForEmail: async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/update-password` });
    },
    signInWithOAuth: async (provider: any) => {
        return await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/dashboard` } });
    },
    onAuthStateChange: (callback: any) => {
        return supabase.auth.onAuthStateChange(callback);
    },
    getSession: async () => {
        return await supabase.auth.getSession();
    },
    updatePassword: async (password: string) => {
        return (await apiClient.post('/api/auth/update-password', { password })).data;
    },
    logout: async () => {
        try {
            await apiClient.post('/api/auth/logout').catch(() => {});
        } catch(e) {}
        // Also clear local session
        if (supabase) {
            await supabase.auth.signOut();
        }
    },
    updateProfile: async (data: { full_name?: string; avatar_url?: string }) => {
        return (await apiClient.post('/api/auth/update-profile', data)).data;
    }
};
