import { commentsService } from "./commentsService.js";
import { supabaseServer } from "../../config/db.js";
import { logger } from "../../utils/logger.js";
import { notificationsService } from "../notifications/notificationsService.js";
import { commentsRepository } from "./commentsRepository.js";
import { coursesRepository } from "../courses/coursesRepository.js";

const getComments = async (req, res) => {
  try {
    const comments = await commentsService.getLectureComments(
      req.query.slug,
      req.query.lectureId,
    );
    res.json({
      comments,
    });
  } catch (err) {
    logger.error("Error fetching comments:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

const postComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = { ...req.body, user_id: userData.user.id };
    const comment = await commentsService.addComment(payload);

    // Notification Logic
    try {
      const link = `/courses/${payload.course_slug}/lecture/${payload.lecture_id}`;
      if (payload.parent_id) {
        // It's a reply
        const parentComment = await commentsRepository.getCommentById(
          payload.parent_id,
        );
        if (parentComment && parentComment.user_id !== userData.user.id) {
          await notificationsService.addNotification({
            user_id: parentComment.user_id,
            title: "New Reply",
            message: `${payload.user_name} replied to your comment.`,
            type: "comment_reply",
            link,
          });
        }
      } else {
        // Top level comment, notify instructor
        const course = await coursesRepository.getBySlugOrId(
          payload.course_slug,
        );
        if (
          course &&
          course.instructor_id &&
          course.instructor_id !== userData.user.id
        ) {
          await notificationsService.addNotification({
            user_id: course.instructor_id,
            title: "New Comment",
            message: `${payload.user_name} posted a comment in ${course.title}.`,
            type: "new_comment",
            link,
          });
        }
      }
    } catch (notifErr) {
      logger.error("Failed to send notification:", notifErr);
    }

    res.json({ comment });
  } catch (err) {
    logger.error("Error adding comment:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    await commentsService.removeComment(req.params.id, userData.user.id);
    res.json({
      success: true,
    });
  } catch (err) {
    logger.error("Error deleting comment:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

const reactToComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: "Emoji is required" });

    const comment = await commentsRepository.getCommentById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    let reactions =
      typeof comment.reactions === "string"
        ? JSON.parse(comment.reactions)
        : comment.reactions || {};
    const userId = userData.user.id;

    // First, remove this user's reaction from any other emojis (to enforce single reaction)
    for (const [existingEmoji, users] of Object.entries(reactions)) {
      if (existingEmoji !== emoji) {
        const idx = users.indexOf(userId);
        if (idx > -1) {
          users.splice(idx, 1);
          if (users.length === 0) delete reactions[existingEmoji];
        }
      }
    }

    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    const userIndex = reactions[emoji].indexOf(userId);

    if (userIndex > -1) {
      // Remove reaction if already reacted with the SAME emoji (toggle off)
      reactions[emoji].splice(userIndex, 1);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      // Add reaction
      reactions[emoji].push(userId);
    }

    const updatedComment = await commentsRepository.updateReactions(
      req.params.id,
      reactions,
    );

    res.json({ comment: updatedComment });
  } catch (err) {
    logger.error("Error reacting to comment:", err);
    res.status(500).json({ error: err.message });
  }
};

export const commentsController = {
  getComments,
  postComment,
  deleteComment,
  reactToComment,
};
