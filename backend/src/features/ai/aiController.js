import { logger } from '../../utils/logger.js';
import { aiService } from './aiService.js';

const getSummary = async (req, res) => {
  try {
    if (!req.body.text) return res.status(400).json({
      error: 'text required'
    });
    const key = process.env.GROQ_API_KEY;
    if (!key) return res.status(500).json({
      error: 'GROQ_API_KEY not configured'
    });
    const data = await aiService.summarize(req.body.text, key);
    res.json({
      data
    });
  } catch (err) { 
    logger.error('Error in aiController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const getChat = async (req, res) => {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) return res.json({
      reply: "I'm currently running in offline mock mode because the API key is not set."
    });
    const data = await aiService.chat(req.body.messages || [], key);
    res.json({
      reply: data.choices[0].message.content
    });
  } catch (err) { 
    logger.error('Error in aiController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

export const aiController = {
  getSummary,
  getChat
};