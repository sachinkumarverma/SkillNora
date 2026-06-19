import express from 'express'
import { authController } from './controller.js';

const router = express.Router()
router.get('/profile', authController.profile)
router.post('/update-password', authController.updatePassword)
router.post('/update-profile', authController.updateProfile)
router.post('/logout', (req, res) => res.json({ ok: true }))

export default router
