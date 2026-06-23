import { usersService } from './usersService.js';

const getProfile = async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const user = await usersService.getProfile(token);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInstructors = async (req, res) => {
    try {
        const instructors = await usersService.getInstructors();
        res.json({ instructors });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const syncUser = async (req, res) => {
    try {
        const { id, email, role } = req.body;
        if (!id || !email) return res.status(400).json({ error: 'id and email required' });
        await usersService.syncUser(id, email, role || 'student');
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
        if (!token) return res.status(401).json({ error: 'Missing token' });
        
        // Get user from token
        const user = await usersService.getProfile(token);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        await usersService.updateProfile(user.id, req.body);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
        if (!token) return res.status(401).json({ error: 'Missing token' });
        
        const user = await usersService.getProfile(token);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        await usersService.updatePassword(user.id, req.body.password);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const logout = async (req, res) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
        if (token) {
            await usersService.logout(token);
        }
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const sendPromotionalEmail = async (req, res) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
        if (!token) return res.status(401).json({ error: 'Missing token' });
        
        // Ensure sender is admin or has permissions
        const sender = await usersService.getProfile(token);
        if (!sender || sender.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can send promotional emails' });
        }

        const result = await usersService.sendPromotionalEmail(req.body);
        res.json({ ok: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const usersController = {
  getProfile,
  getInstructors,
  syncUser,
  updateProfile,
  updatePassword,
  logout,
  sendPromotionalEmail
};
