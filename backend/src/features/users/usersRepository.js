import { supabaseServer, query } from '../../config/db.js';

const getUserByToken = async token => {
  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error) throw new Error(error.message);
  
  const user = data.user;
  // Also get role from users table
  const res = await query('SELECT role FROM users WHERE id = $1', [user.id]);
  if (res.rows.length > 0) {
      user.role = res.rows[0].role;
  }
  return user;
};

const getInstructors = async () => {
    const res = await query('SELECT id, full_name, email FROM users WHERE role IN ($1, $2)', ['instructor', 'admin']);
    return res.rows;
};

const syncUser = async (id, email, role) => {
    await query(
        `INSERT INTO users (id, email, role) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET email = $2, role = EXCLUDED.role`,
        [id, email, role]
    );
    return true;
};

export const usersRepository = {
  getUserByToken,
  getInstructors,
  syncUser
};
