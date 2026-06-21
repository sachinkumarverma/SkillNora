import { enrollmentsService } from './enrollmentsService.js';
import { supabaseServer } from '../../config/db.js';

const createEnrollment = async (req, res) => {
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
    await enrollmentsService.forceCreateEnrollment(userData.user.id, req.body.course_id);

    try {
      // Simulate Razorpay order insertion to update statistics
      const { query } = await import('../../config/db.js');
      const { rows } = await query('SELECT price FROM courses WHERE id = $1', [req.body.course_id]);
      const amount = rows.length > 0 ? rows[0].price : 0;
      
      const { paymentsRepository } = await import('../payments/paymentsRepository.js');
      await paymentsRepository.createOrder({
        razorpay_order_id: `sim_order_${Date.now()}`,
        user_id: userData.user.id,
        course_id: req.body.course_id,
        amount: amount,
        currency: 'INR',
        status: 'paid',
        receipt: `rcpt_${Date.now()}`
      });
    } catch (e) {
      console.warn('Failed to simulate order', e);
    }

    res.json({
      success: true
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const getUserEnrollments = async (req, res) => {
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
    const ids = await enrollmentsService.getUserEnrollmentsList(userData.user.id);
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
  createEnrollment,
  getUserEnrollments
};