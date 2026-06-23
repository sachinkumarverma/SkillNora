import { supabaseServer, query } from '../../config/db.js';

const getUserByToken = async token => {
  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error) throw new Error(error.message);
  
  const user = data.user;
  // Also get role and profile data from users table
  const res = await query('SELECT role, full_name, avatar_url FROM users WHERE id = $1', [user.id]);
  if (res.rows.length > 0) {
      const row = res.rows[0];
      user.role = row.role;
      if (!user.user_metadata) user.user_metadata = {};
      if (row.full_name) user.user_metadata.full_name = row.full_name;
      if (row.avatar_url) user.user_metadata.avatar_url = row.avatar_url;
  }
  return user;
};

const getInstructors = async () => {
    const res = await query('SELECT id, full_name, email, avatar_url FROM users WHERE role IN ($1, $2)', ['instructor', 'admin']);
    return res.rows;
};

const syncUser = async (id, email, role) => {
    await query(
        `INSERT INTO users (id, email, role) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET email = $2, role = EXCLUDED.role`,
        [id, email, role]
    );
    return true;
};

const updateProfile = async (id, profileData) => {
    let q = 'UPDATE users SET ';
    let values = [];
    let idx = 1;
    if (profileData.full_name !== undefined) {
        q += `full_name = $${idx}, `;
        values.push(profileData.full_name);
        idx++;
    }
    if (profileData.avatar_url !== undefined) {
        q += `avatar_url = $${idx}, `;
        values.push(profileData.avatar_url);
        idx++;
    }
    if (values.length === 0) return true;
    
    q = q.slice(0, -2) + ` WHERE id = $${idx}`;
    values.push(id);
    await query(q, values);

    // Sync back to Supabase user_metadata for frontend token consistency
    await supabaseServer.auth.admin.updateUserById(id, { user_metadata: profileData });
    return true;
};

const updatePassword = async (id, password) => {
    const { error } = await supabaseServer.auth.admin.updateUserById(id, { password });
    if (error) throw new Error(error.message);
    return true;
};

const logout = async (token) => {
    // Invalidate the JWT globally using Supabase Admin
    await supabaseServer.auth.admin.signOut(token, 'global');
    return true;
};

import { sendEmail, buildEmailHtml } from '../../utils/email.js';

const sendPromotionalEmail = async ({ targetGroup, title, description, template, cssGradient }) => {
    let allUsers = [];
    let page = 1;
    let hasMore = true;
    
    // Fetch all users from Supabase Auth
    while (hasMore) {
        const { data, error } = await supabaseServer.auth.admin.listUsers({
            page,
            perPage: 1000
        });
        if (error) throw new Error(error.message);
        
        allUsers = allUsers.concat(data.users);
        if (data.users.length < 1000) hasMore = false;
        else page++;
    }

    // Filter based on target group and email_notifications preference
    const recipients = allUsers.filter(user => {
        const meta = user.user_metadata || {};
        const isOptedIn = meta.email_notifications !== false;
        if (!isOptedIn) return false;

        const role = meta.role || 'student';
        if (targetGroup === 'students' && role !== 'student') return false;
        if (targetGroup === 'instructors' && role !== 'instructor' && role !== 'admin') return false;
        return true;
    });

    if (recipients.length === 0) {
        throw new Error('No users found matching criteria with email notifications enabled.');
    }

    // Prepare email HTML
    const htmlContent = buildEmailHtml(`
        <div style="font-size: 16px; color: #334155; line-height: 1.6;">
            ${description.split('\n').map(p => `<p style="margin-bottom: 16px;">${p}</p>`).join('')}
        </div>
        <div style="margin-top: 30px; text-align: center;">
            <a href="https://skillnora.vercel.app" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Visit Skillnora</a>
        </div>
    `, title, cssGradient || 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)');

    // Send emails individually so each recipient is in the 'TO' field (better privacy and UX)
    let successCount = 0;
    for (const u of recipients) {
        const result = await sendEmail({
            to: u.email,
            subject: title,
            html: htmlContent
        });

        if (!result.success) {
            throw new Error(`Failed to send email to ${u.email}. Check backend logs. Error: ` + (result.error?.message || result.error));
        }
        successCount++;
    }

    return { sentCount: successCount };
};

export const usersRepository = {
  getUserByToken,
  getInstructors,
  syncUser,
  updateProfile,
  updatePassword,
  logout,
  sendPromotionalEmail
};
