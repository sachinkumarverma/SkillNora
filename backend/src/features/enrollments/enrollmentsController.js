import { enrollmentsService } from './enrollmentsService.js';
import { supabaseServer } from '../../config/db.js';

const enroll = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({
      error: 'Missing token'
    });
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Invalid token'
    });
    if (!req.body.course_id) return res.status(400).json({
      error: 'course_id required'
    });

    // Allow force enroll from checkout flow (bypassing free check for now)
    await enrollmentsService.forceEnroll(userData.user.id, req.body.course_id);
    res.json({
      success: true
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const getMy = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({
      error: 'Missing token'
    });
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Invalid token'
    });
    const ids = await enrollmentsService.getMyEnrollments(userData.user.id);
    res.json({
      enrolledIds: ids
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

export const enrollmentsController = {
  enroll,
  getMy
};