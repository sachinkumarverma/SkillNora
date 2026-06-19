import apiClient from '@/lib/apiClient';

const getStats = async () => {
    return (await apiClient.get('/api/statistics')).data;
};

export const statisticsService = {
    getStats
};
