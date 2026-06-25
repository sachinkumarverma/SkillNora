import { logger } from '../../utils/logger.js';
import { wishlistService } from './wishlistService.js';
import { supabaseServer } from '../../config/db.js';

const getWishlist = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({ error: 'Invalid token' });
    const wishlist = await wishlistService.getWishlist(userData.user.id);
    res.json({ wishlist });
  } catch (e) { logger.error('Error in wishlistController.js:', e);  res.status(500).json({ error: e.message }); }
};

const addToWishlist = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({ error: 'Invalid token' });
    const wishlist = await wishlistService.addToWishlist(userData.user.id, req.body.course_id);
    res.json({ wishlist });
  } catch (e) { logger.error('Error in wishlistController.js:', e);  res.status(500).json({ error: e.message }); }
};

const removeFromWishlist = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) return res.status(401).json({ error: 'Invalid token' });
    const wishlist = await wishlistService.removeFromWishlist(userData.user.id, req.params.courseId);
    res.json({ wishlist });
  } catch (e) { logger.error('Error in wishlistController.js:', e);  res.status(500).json({ error: e.message }); }
};

export const wishlistController = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
