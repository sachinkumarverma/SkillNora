import { commentsRepository } from "./commentsRepository.js";

const getLectureComments = async (slug, lectureId) => {
  return await commentsRepository.getCommentsByLecture(slug, lectureId);
};

const addComment = async (payload) => {
  return await commentsRepository.insertComment(payload);
};

const removeComment = async (id, userId) => {
  return await commentsRepository.deleteComment(id, userId);
};

export const commentsService = {
  getLectureComments,
  addComment,
  removeComment,
};
