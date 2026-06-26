import { logger } from '../../utils/logger.js';
import { coursesService } from './coursesService.js';
import { coursesRepository } from './coursesRepository.js';
import { supabaseServer } from '../../config/db.js';

const listAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({
      error: 'Unauthorized: Missing token in headers'
    });
    const {
      data: userData, error
    } = await supabaseServer.auth.getUser(token);
    if (error) {
        return res.status(401).json({ error: 'Unauthorized: Auth Error', details: error.message });
    }
    if (!userData?.user) return res.status(401).json({
      error: 'Unauthorized: User not found from token'
    });
    const result = await coursesService.listAdminCourses(userData.user.id);
    res.json(result);
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({
      error: err.message
    });
  }
};

const bulkPublish = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    await coursesService.bulkPublish(userData.user.id, req.body.ids, req.body.status);
    res.json({
      ok: true
    });
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({
      error: err.message
    });
  }
};

const bulkDelete = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    await coursesService.bulkDelete(userData.user.id, req.body.ids);
    res.json({
      ok: true
    });
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({
      error: err.message
    });
  }
};

const updateLectures = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    await coursesService.updateLectures(userData.user.id, req.params.id, req.body.lectures);
    res.json({
      ok: true
    });
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const list = async (req, res) => {
  try {
    const courses = await coursesService.listCourses();
    res.json({
      courses
    });
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const getOne = async (req, res) => {
  try {
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const {
        data: userData
      } = await supabaseServer.auth.getUser(token);
      if (userData?.user) userId = userData.user.id;
    }
    const course = await coursesService.getCourse(req.params.id, userId);
    if (!course) return res.status(404).json({
      error: 'Not found'
    });
    res.json({
      course
    });
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const create = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({
      error: 'Unauthorized'
    });
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Unauthorized'
    });
    const course = await coursesService.createCourse(userData.user.id, req.body);
    res.json({
      course
    });
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const update = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({
      error: 'Unauthorized'
    });
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Unauthorized'
    });
    const course = await coursesService.updateCourse(userData.user.id, req.params.id, req.body);
    res.json({
      course
    });
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const removeCourse = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({
      error: 'Unauthorized'
    });
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Unauthorized'
    });
    await coursesService.deleteCourse(userData.user.id, req.params.id);
    res.json({
      ok: true
    });
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const complete = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({
      error: 'Unauthorized'
    });
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Unauthorized'
    });
    const {
      courseId,
      slug,
      lectureId,
      totalLectures,
      quizScore
    } = req.body;
    if (!courseId || !slug || !lectureId || !totalLectures) return res.status(400).json({
      error: 'Missing parameters'
    });
    const result = await coursesService.completeLecture(userData.user.id, courseId, slug, lectureId, totalLectures, quizScore);
    res.json(result);
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const deleteWithRefund = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const { data: userData } = await supabaseServer.auth.getUser(token);
        if (!userData?.user) return res.status(401).json({ error: 'Unauthorized' });

        const { ids } = req.body;
        if (!ids || ids.length === 0) return res.json({ success: true });
        
        // This simulates the complex refund logic the user had in the frontend
        for (const id of ids) {
            const enrollments = await coursesRepository.getActiveEnrollments(id);
            if (enrollments && enrollments.length > 0) {
                const coursePrice = await coursesRepository.getCoursePrice(id);
                for (const enr of enrollments) {
                    const expiresAt = new Date(enr.expires_at).getTime();
                    const now = new Date().getTime();
                    const remainingMs = expiresAt - now;
                    const msInYear = 365 * 24 * 60 * 60 * 1000;
                    const percentRemaining = Math.max(0, Math.min(1, remainingMs / msInYear));
                    const refundAmount = Math.round(coursePrice * percentRemaining * 100) / 100;
                    
                    if (refundAmount > 0) {
                        await coursesRepository.issueRefund(enr.user_id, id, refundAmount);
                    }
                }
            }
        }
        await coursesService.bulkDelete(userData.user.id, ids);
        res.json({ success: true });
    } catch (err) { 
      logger.error('Error in coursesController.js:', err); 
        res.status(500).json({ error: err.message });
    }
};


const addReview = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { rating, review_text } = req.body;
    const courseId = req.params.id;
    if (!rating || !courseId) return res.status(400).json({ error: 'Missing parameters' });
    
    const result = await coursesService.addReview(userData.user.id, courseId, rating, review_text);
    res.json(result);
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({ error: err.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { rating, review_text } = req.body;
    const reviewId = req.params.reviewId;
    if (!rating || !reviewId) return res.status(400).json({ error: 'Missing parameters' });
    
    const result = await coursesService.updateReview(userData.user.id, reviewId, rating, review_text);
    res.json(result);
  } catch (err) { 
    logger.error('Error in coursesController.js:', err); 
    res.status(500).json({ error: err.message });
  }
};

export const coursesController = {
  listAdmin,
  bulkPublish,
  deleteWithRefund,
  bulkDelete,
  updateLectures,
  list,
  getOne,
  create,
  update,
  removeCourse,
  complete,
  addReview,
  updateReview
};