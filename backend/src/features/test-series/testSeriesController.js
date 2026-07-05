import { testSeriesService } from "./testSeriesService.js";
import { usersService } from "../users/usersService.js";

const getPublicSeries = async (req, res) => {
  try {
    let userId = null;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (token) {
      try {
        const user = await usersService.getProfile(token);
        if (user) userId = user.id;
      } catch (e) {
        // Ignore token errors for public routes
      }
    }
    const { category } = req.query;
    const series = await testSeriesService.getPublicSeries(category, userId);
    res.json({ success: true, testSeries: series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInstructorSeries = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const instructorId = user.id;
    const series = await testSeriesService.getInstructorSeries(instructorId);
    res.json({ success: true, testSeries: series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAdminSeries = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user || user.role !== "admin")
      return res.status(403).json({ error: "Unauthorized" });

    const series = await testSeriesService.getAdminSeries();
    res.json({ success: true, testSeries: series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSeriesDetails = async (req, res) => {
  try {
    let user = null;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (token) {
      user = await usersService.getProfile(token);
    }

    const { id } = req.params;
    const userId = user?.id;
    const role = user?.role;
    const series = await testSeriesService.getSeriesDetails(id, userId, role);
    res.json({ success: true, series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createSeries = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const instructorId = user.id;
    const series = await testSeriesService.createSeries(instructorId, req.body);
    res.status(201).json({ success: true, series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSeries = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { id } = req.params;
    const instructorId = user.id;
    const role = user.role;
    const series = await testSeriesService.updateSeries(
      id,
      instructorId,
      req.body,
      role,
    );
    res.json({ success: true, series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSeries = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { id } = req.params;
    const instructorId = user.id;
    const role = user.role;
    await testSeriesService.deleteSeries(id, instructorId, role);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tests
const getTestDetails = async (req, res) => {
  try {
    let user = null;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (token) {
      user = await usersService.getProfile(token);
    }

    const { testId } = req.params;
    const userId = user?.id;
    const role = user?.role;
    const test = await testSeriesService.getTestDetails(testId, userId, role);
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTest = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { seriesId } = req.params;
    const userId = user.id;
    const role = user.role;
    const test = await testSeriesService.createTest(
      seriesId,
      userId,
      role,
      req.body,
    );
    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTest = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { testId } = req.params;
    const userId = user.id;
    const role = user.role;
    const test = await testSeriesService.updateTest(
      testId,
      userId,
      role,
      req.body,
    );
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTest = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { testId } = req.params;
    const userId = user.id;
    const role = user.role;
    await testSeriesService.deleteTest(testId, userId, role);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateQuestionsWithAI = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { testId } = req.params;
    const userId = user.id;
    const role = user.role;
    await testSeriesService.generateQuestionsWithAI(testId, userId, role);
    res.status(201).json({ success: true, message: "Generated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Questions
const createQuestion = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { testId } = req.params;
    const userId = user.id;
    const role = user.role;
    const question = await testSeriesService.createQuestion(
      testId,
      userId,
      role,
      req.body,
    );
    res.status(201).json({ success: true, question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { questionId, testId } = req.params;
    const userId = user.id;
    const role = user.role;
    const question = await testSeriesService.updateQuestion(
      questionId,
      testId,
      userId,
      role,
      req.body,
    );
    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { questionId, testId } = req.params;
    const userId = user.id;
    const role = user.role;
    await testSeriesService.deleteQuestion(questionId, testId, userId, role);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Attempts
const getUserAttempts = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userId = user.id;
    const { testId } = req.query;
    const attempts = await testSeriesService.getUserAttempts(userId, testId);
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startAttempt = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userId = user.id;
    const { testId } = req.params;
    const attempt = await testSeriesService.startAttempt(userId, testId);
    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const saveProgress = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userId = user.id;
    const { attemptId } = req.params;
    const { state } = req.body;
    const attempt = await testSeriesService.saveProgress(
      attemptId,
      userId,
      state,
    );
    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userId = user.id;
    const { attemptId } = req.params;
    const { state } = req.body;
    const attempt = await testSeriesService.submitAttempt(
      attemptId,
      userId,
      state,
    );
    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAttemptAnalysis = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const user = await usersService.getProfile(token);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userId = user.id;
    const { testId } = req.params;
    const analysis = await testSeriesService.getAttemptAnalysis(userId, testId);
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const testSeriesController = {
  getPublicSeries,
  getInstructorSeries,
  getAdminSeries,
  getSeriesDetails,
  createSeries,
  updateSeries,
  deleteSeries,
  getTestDetails,
  createTest,
  updateTest,
  deleteTest,
  generateQuestionsWithAI,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getUserAttempts,
  startAttempt,
  saveProgress,
  submitAttempt,
  getAttemptAnalysis,
};
