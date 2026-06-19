import apiClient from '@/lib/apiClient';

const getMyCertificates = async () => {
    return (await apiClient.get('/api/certificates/my')).data;
};

const getCertificate = async (id: string) => {
    return (await apiClient.get(`/api/certificates/${id}`)).data;
};

export const certificatesService = {
    getMyCertificates,
    getCertificate
};
