import { notesService } from "./notesService.js";
import { supabaseServer } from "../../config/db.js";
import { logger } from "../../utils/logger.js";

const getNotes = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const notes = await notesService.getNotes(userData.user.id);
    res.json({ notes });
  } catch (e) {
    logger.error("Error fetching notes:", e);
    res.status(500).json({ error: e.message });
  }
};

const saveNote = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const note = await notesService.saveNote(
      userData.user.id,
      req.body.course_id,
      req.body.lecture_id,
      req.body.text,
    );
    res.json({ note });
  } catch (e) {
    logger.error("Error saving note:", e);
    res.status(500).json({ error: e.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    await notesService.deleteNote(userData.user.id, req.params.noteId);
    res.json({ success: true });
  } catch (e) {
    logger.error("Error deleting note:", e);
    res.status(500).json({ error: e.message });
  }
};

const bulkDeleteNotes = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    await notesService.bulkDeleteNotes(userData.user.id, req.body.noteIds);
    res.json({ success: true });
  } catch (e) {
    logger.error("Error bulk deleting notes:", e);
    res.status(500).json({ error: e.message });
  }
};

export const notesController = {
  getNotes,
  saveNote,
  deleteNote,
  bulkDeleteNotes,
};
