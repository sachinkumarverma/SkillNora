import apiClient from '@/lib/apiClient';

const getMe = async () => {
    return (await apiClient.get('/api/users/me')).data;
};

export const usersService = {
    getMe
};
