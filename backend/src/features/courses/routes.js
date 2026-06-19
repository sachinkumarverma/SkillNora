import express from 'express'
import * as controller from './controller.js'

const router = express.Router()

router.get('/', controller.listPublished)
router.get('/admin', controller.listAdmin)
router.post('/', controller.createCourse)
router.post('/bulk-delete', controller.bulkDelete)
router.post('/bulk-publish', controller.bulkPublish)
router.get('/:id', controller.getCourse)
router.put('/:id', controller.updateCourse)
router.post('/:id/lectures', controller.updateLectures)
router.delete('/:id', controller.deleteCourse)

export default router
