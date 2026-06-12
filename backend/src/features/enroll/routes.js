import express from 'express'
import * as controller from './controller.js'

const router = express.Router()
router.post('/', controller.enroll)
export default router
