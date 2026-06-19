import { commentsService } from './commentsService.js';
import { supabaseServer } from '../../config/db.js';

const getComments = async (req, res) => {
  try {
    const comments = await commentsService.getLectureComments(req.query.slug, req.query.lectureId);
    res.json({
      comments
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const postComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Unauthorized'
    });
    const payload = {
      ...req.body,
      user_id: userData.user.id
    };
    const comment = await commentsService.addComment(payload);
    res.json({
      comment
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Unauthorized'
    });
    await commentsService.removeComment(req.params.id, userData.user.id);
    res.json({
      success: true
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

export const commentsController = {
  getComments,
  postComment,
  deleteComment
};