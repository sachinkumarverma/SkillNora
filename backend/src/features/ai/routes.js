import express from 'express'
import * as controller from './controller.js'

const router = express.Router()
router.post('/summary', controller.summary)
export default router
