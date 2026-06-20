import { commentsService } from './commentsService.js';
import { supabaseServer } from '../../config/db.js';
import { notificationsService } from '../notifications/notificationsService.js';
import { commentsRepository } from './commentsRepository.js';
import { coursesRepository } from '../courses/coursesRepository.js';

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
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const payload = { ...req.body, user_id: userData.user.id };
    const comment = await commentsService.addComment(payload);

    // Notification Logic
    try {
        const link = `/courses/${payload.course_slug}/lecture/${payload.lecture_id}`;
        if (payload.parent_id) {
            // It's a reply
            const parentComment = await commentsRepository.getCommentById(payload.parent_id);
            if (parentComment && parentComment.user_id !== userData.user.id) {
                await notificationsService.addNotification({
                    user_id: parentComment.user_id,
                    title: 'New Reply',
                    message: `${payload.user_name} replied to your comment.`,
                    type: 'comment_reply',
                    link
                });
            }
        } else {
            // Top level comment, notify instructor
            const course = await coursesRepository.getBySlugOrId(payload.course_slug);
            if (course && course.instructor_id && course.instructor_id !== userData.user.id) {
                await notificationsService.addNotification({
                    user_id: course.instructor_id,
                    title: 'New Comment',
                    message: `${payload.user_name} posted a comment in ${course.title}.`,
                    type: 'new_comment',
                    link
                });
            }
        }
    } catch (notifErr) {
        console.error("Failed to send notification:", notifErr);
    }

    res.json({ comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
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