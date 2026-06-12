import express from 'express'
import * as controller from './controller.js'

const router = express.Router()

router.post('/signed-url', controller.getSignedUrl)

export default router
