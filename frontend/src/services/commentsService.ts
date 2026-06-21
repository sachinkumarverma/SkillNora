import apiClient from '@/lib/apiClient';

const getComments = async (slug: string, lectureId: string) => {
    return (await apiClient.get(`/api/comments?slug=${slug}&lectureId=${lectureId}`)).data;
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
