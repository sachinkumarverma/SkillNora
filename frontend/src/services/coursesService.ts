import apiClient from '@/lib/apiClient';

const getAll = async () => {
    return (await apiClient.get('/api/courses')).data;
};

const getOneCache = new Map<string, Promise<any>>();

const getOne = async (slugOrId: string) => {
    if (getOneCache.has(slugOrId)) {
        return getOneCache.get(slugOrId);
    }
    const promise = (async () => {
        try {
            const res = await apiClient.get(`/api/courses/${slugOrId}`);
            return res.data;
        } finally {
            setTimeout(() => getOneCache.delete(slugOrId), 5000); // Clear cache after 5 seconds to allow fresh fetches on manual refresh
        }
    })();
    getOneCache.set(slugOrId, promise);
    return promise;
};

const getAdminAll = async () => {
    return (await apiClient.get('/api/courses/admin')).data;
};

const create = async (data: any) => {
    return (await apiClient.post('/api/courses', data)).data;
};

const update = async (id: string, data: any) => {
    return (await apiClient.put(`/api/courses/${id}`, data)).data;
};

const bulkDelete = async (ids: string[]) => {
    return (await apiClient.post('/api/courses/bulk-delete', { ids })).data;
};

const bulkPublish = async (ids: string[], status: boolean) => {
    return (await apiClient.post('/api/courses/bulk-publish', { ids, status })).data;
};

const updateLectures = async (courseId: string, lectures: any[]) => {
    return (await apiClient.post(`/api/courses/${courseId}/lectures`, { lectures })).data;
};

const completeLecture = async (data: any) => {
    return (await apiClient.post('/api/courses/complete', data)).data;
};

export const coursesService = {
    getAll,
    getOne,
    getAdminAll,
    create,
    update,
    bulkDelete,
    bulkPublish,
    updateLectures,
    completeLecture
};
