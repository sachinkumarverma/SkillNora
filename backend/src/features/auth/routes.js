import express from 'express'
import * as controller from './controller.js'

const router = express.Router()
router.get('/profile', controller.profile)
export default router
