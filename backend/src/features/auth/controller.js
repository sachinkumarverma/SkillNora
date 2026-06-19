import { supabaseServer } from '../../config/db.js';

const profile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const { data, error } = await supabaseServer.auth.getUser(token)
        if (error) return res.status(401).json({ error: error.message })
        res.json({ user: data.user })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const updatePassword = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null;
        if (!token) return res.status(401).json({ error: 'Missing token' });
        const { password } = req.body;
        if (!password) return res.status(400).json({ error: 'Password is required' });

        const { data: userData, error: userError } = await supabaseServer.auth.getUser(token);
        if (userError || !userData.user) return res.status(401).json({ error: 'Unauthorized' });

        const { error } = await supabaseServer.auth.admin.updateUserById(userData.user.id, { password });
        if (error) return res.status(400).json({ error: error.message });

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
}

const updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null;
        if (!token) return res.status(401).json({ error: 'Missing token' });
        const { full_name, avatar_url } = req.body;

        const { data: userData, error: userError } = await supabaseServer.auth.getUser(token);
        if (userError || !userData.user) return res.status(401).json({ error: 'Unauthorized' });

        const user_metadata = {};
        if (full_name !== undefined) user_metadata.full_name = full_name;
        if (avatar_url !== undefined) {
            user_metadata.avatar_url = avatar_url;
            user_metadata.picture = avatar_url;
        }

        const { error } = await supabaseServer.auth.admin.updateUserById(userData.user.id, { user_metadata });
        if (error) return res.status(400).json({ error: error.message });

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
}

export const authController = {
    profile,
    updatePassword,
    updateProfile
};
