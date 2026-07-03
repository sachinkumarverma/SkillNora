import apiClient from '@/lib/apiClient';

const getCommentsCache = new Map<string, Promise<any>>();

const getComments = async (slug: string, lectureId: string) => {
    const key = `${slug}_${lectureId}`;
    if (getCommentsCache.has(key)) {
        return getCommentsCache.get(key);
    }
    const promise = (async () => {
        try {
            const res = await apiClient.get(`/api/comments?slug=${slug}&lectureId=${lectureId}`);
            return res.data;
        } finally {
            setTimeout(() => getCommentsCache.delete(key), 5000); // Clear cache after 5 seconds to allow fresh fetches on manual refresh
        }
    })();
    getCommentsCache.set(key, promise);
    return promise;
};

const addComment = async (data: any) => {
    return (await apiClient.post('/api/comments', data)).data;
};

const deleteComment = async (id: string) => {
    return (await apiClient.delete(`/api/comments/${id}`)).data;
};

const reactToComment = async (id: string, emoji: string) => {
    return (await apiClient.post(`/api/comments/${id}/react`, { emoji })).data;
};

export const commentsService = {
    getComments,
    addComment,
    deleteComment,
    reactToComment
};
