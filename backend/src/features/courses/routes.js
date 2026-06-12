import express from 'express'
import * as controller from './controller.js'

const router = express.Router()

router.get('/', controller.listPublished)
router.post('/', controller.createCourse)
router.get('/:id', controller.getCourse)
router.put('/:id', controller.updateCourse)
router.delete('/:id', controller.deleteCourse)

export default router
