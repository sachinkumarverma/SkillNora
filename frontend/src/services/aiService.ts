import apiClient from '@/lib/apiClient';

const chat = async (message: string) => {
    return (await apiClient.post('/api/ai/chat', { message })).data;
};

export const aiService = {
    chat
};
