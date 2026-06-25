import { logger } from '../../utils/logger.js';
import { notificationsService } from './notificationsService.js';
import { supabaseServer } from '../../config/db.js';

const getUserNotifications = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Missing token' });
        const { data: userData } = await supabaseServer.auth.getUser(token);
        if (!userData.user) return res.status(401).json({ error: 'Invalid token' });
        
        const notifications = await notificationsService.getUserNotificationsList(userData.user.id);
        res.json({ notifications });
    } catch (err) { 
        logger.error('Error in notificationsController.js:', err); 
        res.status(500).json({ error: err.message });
    }
};

const markRead = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Missing token' });
        const { data: userData } = await supabaseServer.auth.getUser(token);
        if (!userData.user) return res.status(401).json({ error: 'Invalid token' });
        
        await notificationsService.markAsRead(userData.user.id);
        res.json({ success: true });
    } catch (err) { 
        logger.error('Error in notificationsController.js:', err); 
        res.status(500).json({ error: err.message });
    }
};

export const notificationsController = { getUserNotifications, markRead };
