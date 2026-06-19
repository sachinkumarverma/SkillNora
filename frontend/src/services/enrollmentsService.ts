import apiClient from '@/lib/apiClient';

const getMyEnrollments = async () => {
    return (await apiClient.get('/api/enroll/my')).data;
};

const enroll = async (course_id: string) => {
    return (await apiClient.post('/api/enroll', { course_id })).data;
};

export const enrollmentsService = {
    getMyEnrollments,
    enroll
};
