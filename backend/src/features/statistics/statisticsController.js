import { logger } from '../../utils/logger.js';
import { statisticsService } from './statisticsService.js';
import { supabaseServer } from '../../config/db.js';

const getStats = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const {
      data: userData
    } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({
      error: 'Unauthorized'
    });
    const {
      data: profile
    } = await supabaseServer.from('users').select('role').eq('id', userData.user.id).single();
    const stats = await statisticsService.getDashboardStats(userData.user.id, profile?.role || 'student');
    res.json({
      stats
    });
  } catch (err) { 
    logger.error('Error in statisticsController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

export const statisticsController = {
  getStats
};