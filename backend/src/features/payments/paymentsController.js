import { paymentsService } from './paymentsService.js';

const createOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = 'INR',
      receipt,
      user_id = null,
      course_id = null
    } = req.body;
    const order = await paymentsService.createRazorpayOrder(amount, currency, receipt, user_id, course_id);
    res.json({
      order
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const webhook = async (req, res) => {
  try {
    await paymentsService.verifyWebhook(req.body, req.headers['x-razorpay-signature'] || '');
    res.json({
      ok: true
    });
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

export const paymentsController = {
  createOrder,
  webhook
};