import fetch from "node-fetch";
import { testSeriesRepository } from "./testSeriesRepository.js";

const getPublicSeries = async (category, userId = null) => {
  return await testSeriesRepository.getAllTestSeries(category, userId);
};

const getInstructorSeries = async (instructorId) => {
  return await testSeriesRepository.getInstructorTestSeries(instructorId);
};

const getAdminSeries = async () => {
  return await testSeriesRepository.getAdminTestSeries();
};

const getSeriesDetails = async (id, userId, role) => {
  const series = await testSeriesRepository.getTestSeriesById(id);
  if (!series) throw new Error("Test Series not found");
  
  if (!series.is_published && role !== 'admin' && userId !== series.instructor_id) {
    throw new Error("Unauthorized");
  }
  
  const tests = await testSeriesRepository.getTestsBySeriesId(id);
  return { ...series, tests };
};

const createSeries = async (instructorId, data) => {
  return await testSeriesRepository.createTestSeries({ ...data, instructor_id: instructorId });
};

const updateSeries = async (id, instructorId, data, role) => {
  const series = await testSeriesRepository.getTestSeriesById(id);
  if (!series) throw new Error("Not found");
  if (role !== 'admin' && series.instructor_id !== instructorId) throw new Error("Unauthorized");
  return await testSeriesRepository.updateTestSeries(id, data);
};

const deleteSeries = async (id, instructorId, role) => {
  const series = await testSeriesRepository.getTestSeriesById(id);
  if (!series) return;
  if (role !== 'admin' && series.instructor_id !== instructorId) throw new Error("Unauthorized");
  await testSeriesRepository.deleteTestSeries(id);
};

// Tests
const getTestDetails = async (testId, userId, role) => {
  const test = await testSeriesRepository.getTestById(testId);
  if (!test) throw new Error("Test not found");
  const series = await testSeriesRepository.getTestSeriesById(test.series_id);
  
  const isInstructorOrAdmin = role === 'admin' || (series && series.instructor_id === userId);
  const includeAnswers = isInstructorOrAdmin;
  
  const questions = await testSeriesRepository.getQuestionsByTestId(testId, includeAnswers);
  return { ...test, series, questions };
};

const createTest = async (seriesId, userId, role, data) => {
  const series = await testSeriesRepository.getTestSeriesById(seriesId);
  if (role !== 'admin' && series.instructor_id !== userId) throw new Error("Unauthorized");
  
  const { questions, ...testData } = data;
  const test = await testSeriesRepository.createTest({ ...testData, series_id: seriesId });
  
  if (questions && Array.isArray(questions)) {
    for (const q of questions) {
      await testSeriesRepository.createQuestion({
        test_id: test.id,
        section_name: q.section_name || 'General',
        question_text: q.question_text || q.question, // handling both names
        options: q.options,
        correct_option_index: q.correct_option_index !== undefined ? q.correct_option_index : q.correctIndex,
        positive_marks: q.positive_marks || 1,
        negative_marks: q.negative_marks || 0
      });
    }
  }
  
  return test;
};

const updateTest = async (testId, userId, role, data) => {
  const test = await testSeriesRepository.getTestById(testId);
  if (!test) throw new Error("Test not found");
  const series = await testSeriesRepository.getTestSeriesById(test.series_id);
  if (role !== 'admin' && series.instructor_id !== userId) throw new Error("Unauthorized");
  return await testSeriesRepository.updateTest(testId, data);
};

const deleteTest = async (testId, userId, role) => {
  const test = await testSeriesRepository.getTestById(testId);
  if (!test) return;
  const series = await testSeriesRepository.getTestSeriesById(test.series_id);
  if (role !== 'admin' && series.instructor_id !== userId) throw new Error("Unauthorized");
  await testSeriesRepository.deleteTest(testId);
};


const generateQuestionsWithAI = async (testId, userId, role) => {
  const test = await testSeriesRepository.getTestById(testId);
  if (!test) throw new Error("Test not found");
  
  const series = await testSeriesRepository.getTestSeriesById(test.series_id);
  if (role !== 'admin' && series.instructor_id !== userId) throw new Error("Unauthorized");
  
  const prompt = `You are a helpful AI designed to generate multiple-choice questions for a test named "${test.title}" in the category "${series.category || 'General'}".
Please generate exactly 30 multiple-choice questions. 
Include a mix of difficulty levels. If the category is IT-related (like Web Development, Data Science, Artificial Intelligence, Information Technology, Cloud Computing), include some medium-level code-based MCQs.
Return the output ONLY as a valid JSON array of objects. Do not include any other text, markdown formatting, or explanation.
Each object must have the following structure:
{
  "question_text": "The question text here",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correct_option_index": 0
}
All questions must be strictly MCQ with exactly 4 options. The correct_option_index must be an integer between 0 and 3.`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(await response.text());
  
  const data = await response.json();
  let questionsData;
  try {
      let content = data.choices[0].message.content.trim();
      content = content.replace(/^\s*```json/i, '').replace(/```\s*$/i, '').trim();
      questionsData = JSON.parse(content);
  } catch(e) {
      console.error("AI Parse Error:", e, data.choices[0].message.content);
      throw new Error("Failed to parse AI response into JSON");
  }

  // Create the questions
  for (const q of questionsData) {
     await testSeriesRepository.createQuestion({
       test_id: testId,
       question_text: q.question_text,
       options: q.options,
       correct_option_index: q.correct_option_index,
       positive_marks: 1,
       negative_marks: 0
     });
  }

  return true;
};

// Questions
const createQuestion = async (testId, userId, role, data) => {
  const test = await testSeriesRepository.getTestById(testId);
  const series = await testSeriesRepository.getTestSeriesById(test.series_id);
  if (role !== 'admin' && series.instructor_id !== userId) throw new Error("Unauthorized");
  return await testSeriesRepository.createQuestion({ ...data, test_id: testId });
};

const updateQuestion = async (questionId, testId, userId, role, data) => {
  const test = await testSeriesRepository.getTestById(testId);
  const series = await testSeriesRepository.getTestSeriesById(test.series_id);
  if (role !== 'admin' && series.instructor_id !== userId) throw new Error("Unauthorized");
  return await testSeriesRepository.updateQuestion(questionId, data);
};

const deleteQuestion = async (questionId, testId, userId, role) => {
  const test = await testSeriesRepository.getTestById(testId);
  const series = await testSeriesRepository.getTestSeriesById(test.series_id);
  if (role !== 'admin' && series.instructor_id !== userId) throw new Error("Unauthorized");
  await testSeriesRepository.deleteQuestion(questionId);
};

// Attempts
const getUserAttempts = async (userId, testId) => {
  return await testSeriesRepository.getAttemptsByUser(userId, testId);
};

const startAttempt = async (userId, testId) => {
  return await testSeriesRepository.startAttempt(userId, testId);
};

const saveProgress = async (attemptId, userId, stateData) => {
  return await testSeriesRepository.saveProgress(attemptId, userId, stateData);
};

const submitAttempt = async (attemptId, userId, answersState) => {
  // calculate score based on answersState and actual questions
  // We need to fetch the attempt to get the testId
  const attempts = await testSeriesRepository.getAttemptsByUser(userId);
  const attempt = attempts.find(a => a.id === attemptId);
  if (!attempt) throw new Error("Attempt not found");

  const questions = await testSeriesRepository.getQuestionsByTestId(attempt.test_id, true); // true to get answers
  
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  questions.forEach(q => {
    const userAnswerIndex = answersState.answers ? answersState.answers[q.id] : null;
    if (userAnswerIndex !== null && userAnswerIndex !== undefined) {
      if (Number(userAnswerIndex) === Number(q.correct_option_index)) {
        score += Number(q.positive_marks);
        correctCount++;
      } else {
        score -= Number(q.negative_marks);
        incorrectCount++;
      }
    } else {
      unattemptedCount++;
    }
  });

  const correctnessStats = {
    correct: correctCount,
    incorrect: incorrectCount,
    unattempted: unattemptedCount,
    total: questions.length
  };

  return await testSeriesRepository.submitAttempt(attemptId, userId, score, correctnessStats, answersState);
};

const getAttemptAnalysis = async (userId, testId) => {
  console.log("getAttemptAnalysis called for userId:", userId, "testId:", testId);
  const attempts = await testSeriesRepository.getAttemptsByUser(userId);
  console.log("Total attempts for user:", attempts.length);
  attempts.forEach(a => console.log("Attempt:", a.id, "TestId:", a.test_id, "Status:", a.status));
  
  const attempt = attempts.find(a => a.test_id === testId && a.status === 'completed');
  if (!attempt) throw new Error("No completed attempt found for this test");

  const test = await testSeriesRepository.getTestById(testId);
  const questions = await testSeriesRepository.getQuestionsByTestId(testId, true);

  // Get all completed attempts for this test to calculate percentile
  const { query } = await import('../../config/db.js');
  const allAttemptsSql = `SELECT user_id, score, created_at FROM test_attempts WHERE test_id = $1 AND status = 'completed' ORDER BY score DESC`;
  const { rows: allAttempts } = await query(allAttemptsSql, [testId]);

  let rank = 1;
  let studentsBelow = 0;
  
  if (allAttempts.length > 0) {
    rank = allAttempts.findIndex(a => a.user_id === userId) + 1;
    if (rank === 0) rank = allAttempts.length; // fallback
    studentsBelow = allAttempts.length - rank;
  }
  
  const percentile = allAttempts.length > 1 ? Math.round((studentsBelow / (allAttempts.length - 1)) * 100) : 100;

  return {
    attempt,
    test,
    questions,
    stats: {
      rank,
      totalStudents: allAttempts.length,
      percentile
    }
  };
};

export const testSeriesService = {
  getPublicSeries, getInstructorSeries, getAdminSeries, getSeriesDetails, createSeries, updateSeries, deleteSeries,
  getTestDetails, createTest, updateTest, deleteTest, generateQuestionsWithAI,
  createQuestion, updateQuestion, deleteQuestion,
  getUserAttempts, startAttempt, saveProgress, submitAttempt, getAttemptAnalysis
};
