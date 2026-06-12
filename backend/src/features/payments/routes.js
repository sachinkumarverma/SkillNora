import express from 'express'
import * as controller from './controller.js'

const router = express.Router()

router.post('/create-order', controller.createOrder)
router.post('/webhook', controller.webhook)
// Dev helper to simulate a webhook POST (not for production)
router.post('/simulate', controller.simulate)

export default router
