import apiClient from '@/lib/apiClient';

const getUserEnrollments = async () => {
    return (await apiClient.get('/api/enrollments/user')).data;
};

const createEnrollment = async (course_id: string) => {
    return (await apiClient.post('/api/enrollments', { course_id })).data;
};

export const enrollmentsService = {
    getUserEnrollments,
    createEnrollment
};
