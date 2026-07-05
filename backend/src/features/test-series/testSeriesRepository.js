import { query } from "../../config/db.js";

// --- Test Series ---
const getAllTestSeries = async (category = null, userId = null) => {
  let sql = `SELECT ts.*, u.full_name as instructor_name, 
             (SELECT COUNT(*) FROM tests t WHERE t.series_id = ts.id) as tests_count,
             (SELECT COUNT(DISTINCT ta.user_id) FROM test_attempts ta JOIN tests t2 ON ta.test_id = t2.id WHERE t2.series_id = ts.id) as total_students
             ${userId ? `, (SELECT COUNT(DISTINCT ta.test_id) FROM test_attempts ta JOIN tests t2 ON ta.test_id = t2.id WHERE t2.series_id = ts.id AND ta.user_id = $${category ? 2 : 1} AND ta.status = 'completed') as completed_tests` : ""}
             FROM test_series ts 
             JOIN users u ON ts.instructor_id = u.id 
             WHERE ts.is_published = true`;
  const params = [];
  if (category) {
    params.push(category);
    sql += ` AND ts.category = $1`;
  }
  if (userId) {
    params.push(userId);
  }
  sql += ` ORDER BY ts.created_at DESC`;
  const { rows } = await query(sql, params);
  return rows;
};

const getInstructorTestSeries = async (instructorId) => {
  const sql = `SELECT ts.*, (SELECT COUNT(*) FROM tests t WHERE t.series_id = ts.id) as tests_count 
               FROM test_series ts 
               WHERE ts.instructor_id = $1 
               ORDER BY ts.created_at DESC`;
  const { rows } = await query(sql, [instructorId]);
  return rows;
};

const getAdminTestSeries = async () => {
  const sql = `SELECT ts.*, u.full_name as instructor_name, (SELECT COUNT(*) FROM tests t WHERE t.series_id = ts.id) as tests_count 
               FROM test_series ts 
               LEFT JOIN users u ON ts.instructor_id = u.id 
               ORDER BY ts.created_at DESC`;
  const { rows } = await query(sql);
  return rows;
};

const getTestSeriesById = async (id) => {
  const sql = `SELECT * FROM test_series WHERE id = $1`;
  const { rows } = await query(sql, [id]);
  return rows[0];
};

const createTestSeries = async (data) => {
  const sql = `INSERT INTO test_series (instructor_id, title, description, category, thumbnail_url, is_published) 
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const { rows } = await query(sql, [
    data.instructor_id,
    data.title,
    data.description,
    data.category,
    data.thumbnail_url,
    data.is_published || false,
  ]);
  return rows[0];
};

const updateTestSeries = async (id, data) => {
  const sql = `UPDATE test_series SET title = $1, description = $2, category = $3, thumbnail_url = $4, is_published = $5, updated_at = now() 
               WHERE id = $6 RETURNING *`;
  const { rows } = await query(sql, [
    data.title,
    data.description,
    data.category,
    data.thumbnail_url,
    data.is_published,
    id,
  ]);
  return rows[0];
};

const deleteTestSeries = async (id) => {
  await query(`DELETE FROM test_series WHERE id = $1`, [id]);
  return true;
};

// --- Tests ---
const getTestsBySeriesId = async (seriesId) => {
  const sql = `SELECT * FROM tests WHERE series_id = $1 ORDER BY created_at ASC`;
  const { rows } = await query(sql, [seriesId]);
  return rows;
};

const getTestById = async (id) => {
  const sql = `SELECT * FROM tests WHERE id = $1`;
  const { rows } = await query(sql, [id]);
  return rows[0];
};

const createTest = async (data) => {
  const sql = `INSERT INTO tests (series_id, title, duration_minutes, total_marks, instructions) 
               VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const { rows } = await query(sql, [
    data.series_id,
    data.title,
    data.duration_minutes,
    data.total_marks,
    data.instructions,
  ]);
  return rows[0];
};

const updateTest = async (id, data) => {
  const sql = `UPDATE tests SET title = $1, duration_minutes = $2, total_marks = $3, instructions = $4, updated_at = now() 
               WHERE id = $5 RETURNING *`;
  const { rows } = await query(sql, [
    data.title,
    data.duration_minutes,
    data.total_marks,
    data.instructions,
    id,
  ]);
  return rows[0];
};

const deleteTest = async (id) => {
  await query(`DELETE FROM tests WHERE id = $1`, [id]);
  return true;
};

// --- Questions ---
const getQuestionsByTestId = async (testId, includeAnswers = true) => {
  let sql = `SELECT * FROM test_questions WHERE test_id = $1 ORDER BY created_at ASC`;
  const { rows } = await query(sql, [testId]);

  if (!includeAnswers) {
    return rows.map((r) => ({
      ...r,
      correct_option_index: undefined, // hide answers for students taking test
    }));
  }
  return rows;
};

const createQuestion = async (data) => {
  const sql = `INSERT INTO test_questions (test_id, section_name, question_text, options, correct_option_index, positive_marks, negative_marks) 
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  const { rows } = await query(sql, [
    data.test_id,
    data.section_name || "General",
    data.question_text,
    JSON.stringify(data.options),
    data.correct_option_index,
    data.positive_marks,
    data.negative_marks,
  ]);
  return rows[0];
};

const updateQuestion = async (id, data) => {
  const sql = `UPDATE test_questions SET section_name = $1, question_text = $2, options = $3, correct_option_index = $4, positive_marks = $5, negative_marks = $6 
               WHERE id = $7 RETURNING *`;
  const { rows } = await query(sql, [
    data.section_name,
    data.question_text,
    JSON.stringify(data.options),
    data.correct_option_index,
    data.positive_marks,
    data.negative_marks,
    id,
  ]);
  return rows[0];
};

const deleteQuestion = async (id) => {
  await query(`DELETE FROM test_questions WHERE id = $1`, [id]);
  return true;
};

// --- Attempts ---
const getAttemptsByUser = async (userId, testId = null) => {
  let sql = `SELECT a.*, t.title as test_title, ts.title as series_title 
             FROM test_attempts a 
             JOIN tests t ON a.test_id = t.id 
             JOIN test_series ts ON t.series_id = ts.id 
             WHERE a.user_id = $1`;
  const params = [userId];
  if (testId) {
    sql += ` AND a.test_id = $2`;
    params.push(testId);
  }
  sql += ` ORDER BY a.updated_at DESC`;
  const { rows } = await query(sql, params);
  return rows;
};

const startAttempt = async (userId, testId) => {
  // Check if attempt exists and is in progress
  const existingSql = `SELECT * FROM test_attempts WHERE user_id = $1 AND test_id = $2 AND status = 'in_progress' ORDER BY created_at DESC LIMIT 1`;
  const { rows: existing } = await query(existingSql, [userId, testId]);

  if (existing.length > 0) {
    return existing[0]; // Resume
  }

  // Clear any old attempts for this test so we only have one attempt per user
  await query(`DELETE FROM test_attempts WHERE user_id = $1 AND test_id = $2`, [
    userId,
    testId,
  ]);

  // Create new attempt
  const sql = `INSERT INTO test_attempts (user_id, test_id, saved_state) VALUES ($1, $2, '{}'::jsonb) RETURNING *`;
  const { rows } = await query(sql, [userId, testId]);
  return rows[0];
};

const saveProgress = async (attemptId, userId, stateData) => {
  const sql = `UPDATE test_attempts SET saved_state = $1, updated_at = now() WHERE id = $2 AND user_id = $3 RETURNING *`;
  const { rows } = await query(sql, [
    JSON.stringify(stateData),
    attemptId,
    userId,
  ]);
  return rows[0];
};

const submitAttempt = async (
  attemptId,
  userId,
  score,
  correctnessStats,
  finalState,
) => {
  const sql = `UPDATE test_attempts 
               SET status = 'completed', end_time = now(), score = $1, correctness_stats = $2, saved_state = $3, updated_at = now() 
               WHERE id = $4 AND user_id = $5 RETURNING *`;
  const { rows } = await query(sql, [
    score,
    JSON.stringify(correctnessStats),
    JSON.stringify(finalState),
    attemptId,
    userId,
  ]);
  return rows[0];
};

export const testSeriesRepository = {
  getAllTestSeries,
  getInstructorTestSeries,
  getAdminTestSeries,
  getTestSeriesById,
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
  getTestsBySeriesId,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getQuestionsByTestId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAttemptsByUser,
  startAttempt,
  saveProgress,
  submitAttempt,
};
