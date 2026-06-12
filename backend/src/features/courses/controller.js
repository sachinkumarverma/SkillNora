import * as service from './service.js'

export async function listPublished(req, res) {
    try {
        const courses = await service.listPublished()
        res.json({ courses })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export async function createCourse(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const body = req.body
        const course = await service.createCourse(token, body)
        res.json({ course })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export async function getCourse(req, res) {
    try {
        const { id } = req.params
        const course = await service.getCourse(id)
        res.json({ course })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export async function updateCourse(req, res) {
    try {
        const { id } = req.params
        const token = req.headers.authorization?.split(' ')[1] ?? null
        const body = req.body
        const course = await service.updateCourse(token, id, body)
        res.json({ course })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export async function deleteCourse(req, res) {
    try {
        const { id } = req.params
        const token = req.headers.authorization?.split(' ')[1] ?? null
        await service.deleteCourse(token, id)
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}
