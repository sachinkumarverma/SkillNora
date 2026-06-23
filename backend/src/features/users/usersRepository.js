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

export const usersRepository = {
  getUserByToken,
  getInstructors,
  syncUser,
  updateProfile,
  updatePassword,
  logout
};
