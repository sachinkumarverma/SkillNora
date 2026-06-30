import { logger } from "../../utils/logger.js";
import { cartService } from "./cartService.js";
import { supabaseServer } from "../../config/db.js";

const getCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const cart = await cartService.getCart(userData.user.id);
    res.json({ cart });
  } catch (e) {
    logger.error("Error in cartController.js:", e);
    res.status(500).json({ error: e.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const cart = await cartService.addToCart(
      userData.user.id,
      req.body.course_id,
    );
    res.json({ cart });
  } catch (e) {
    logger.error("Error in cartController.js:", e);
    res.status(500).json({ error: e.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const cart = await cartService.removeFromCart(
      userData.user.id,
      req.params.courseId,
    );
    res.json({ cart });
  } catch (e) {
    logger.error("Error in cartController.js:", e);
    res.status(500).json({ error: e.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    await cartService.clearCart(userData.user.id);
    res.json({ success: true });
  } catch (e) {
    logger.error("Error in cartController.js:", e);
    res.status(500).json({ error: e.message });
  }
};

export const cartController = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};
