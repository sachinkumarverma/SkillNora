import { logger } from "../../utils/logger.js";
import { aiService } from "./aiService.js";
import { query } from "../../config/db.js";

const getSummary = async (req, res) => {
  try {
    if (!req.body.text)
      return res.status(400).json({
        error: "text required",
      });
    const key = process.env.GROQ_API_KEY;
    if (!key)
      return res.status(500).json({
        error: "GROQ_API_KEY not configured",
      });
    const data = await aiService.summarize(req.body.text, key);
    res.json({
      data,
    });
  } catch (err) {
    logger.error("Error in aiController.js:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

const getChat = async (req, res) => {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key)
      return res.json({
        reply:
          "I'm currently running in offline mock mode because the API key is not set.",
      });
    // Fetch published courses for AI context
    let courseContext = "No courses available.";
    try {
      const { rows } = await query(`
        SELECT id, title, slug, price, discount_price, category
        FROM courses 
        WHERE is_published = true
        LIMIT 20
      `);
      if (rows.length > 0) {
        courseContext = rows.map(c => {
          const hasDiscount = c.discount_price != null && Number(c.discount_price) < Number(c.price);
          const displayPrice = hasDiscount ? `₹${c.discount_price} (original ₹${c.price})` : (Number(c.price) > 0 ? `₹${c.price}` : 'Free');
          return `- ${c.title} (Category: ${c.category || 'General'}, Price: ${displayPrice}). Link: /courses/${c.slug}/${c.id || ''}`;
        }).join('\n');
      }
    } catch (e) {
      logger.error("Error fetching courses for AI context", e);
    }

    const data = await aiService.chat(req.body.messages || [], key, courseContext, req.body.options || {});
    res.json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    logger.error("Error in aiController.js:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

export const aiController = {
  getSummary,
  getChat,
};
