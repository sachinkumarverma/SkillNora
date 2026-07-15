import apiClient from '@/lib/apiClient';
import supabase from '@/lib/supabaseClient';

const signUp = async (email: string, password: string, role: string, fullName: string = '') => {
    return await supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { role, full_name: fullName } 
        } 
    });
};

const signInWithPassword = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
};

const signInWithOtp = async (email: string) => {
    return await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
};

const resetPasswordForEmail = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/update-password` });
};

const signInWithOAuth = async (provider: any) => {
    return await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });
};

const onAuthStateChange = (callback: any) => {
    return supabase.auth.onAuthStateChange(callback);
};

const getSession = async () => {
    return await supabase.auth.getSession();
};

const updatePassword = async (password: string) => {
    return (await apiClient.post('/api/auth/update-password', { password })).data;
};

const logout = async () => {
    try {
        await apiClient.post('/api/auth/logout');
    } catch (err) {
        console.warn('Backend logout failed or missing', err);
    }
    // Force reload and clear client-side state
    if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
                localStorage.removeItem(key);
            }
        });
        window.location.href = '/auth';
    }
};

const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    const res = (await apiClient.post('/api/users/update-profile', data)).data;
    // Refresh local session so the new user_metadata is saved to localStorage
    await supabase.auth.refreshSession();
    return res;
};

export const authService = {
    signUp,
    signInWithPassword,
    signInWithOtp,
    resetPasswordForEmail,
    signInWithOAuth,
    onAuthStateChange,
    getSession,
    updatePassword,
    logout,
    updateProfile
};
