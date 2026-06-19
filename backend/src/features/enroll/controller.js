import * as service from './service.js'

const enroll = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        const { course_id } = req.body
        const enrollment = await service.enroll(token, course_id)
        res.json({ enrollment })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export { enroll };
