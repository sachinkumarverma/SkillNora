import * as service from './service.js'

const listPublished = async (req, res) => {
    try {
        const courses = await service.listPublished()
        res.json({ courses })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const listAdmin = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const courses = await service.listAdmin(token)
        res.json({ courses })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const createCourse = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const body = req.body
        const course = await service.createCourse(token, body)
        res.json({ course })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const getCourse = async (req, res) => {
    try {
        const { id } = req.params
        const course = await service.getCourse(id)
        res.json({ course })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params
        const token = req.headers.authorization?.split(' ')[1] ?? null
        const body = req.body
        const course = await service.updateCourse(token, id, body)
        res.json({ course })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params
        const token = req.headers.authorization?.split(' ')[1] ?? null
        await service.deleteCourse(token, id)
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const bulkDelete = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        const { ids } = req.body
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid input' })
        await service.bulkDelete(token, ids)
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const bulkPublish = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        const { ids, status } = req.body
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid input' })
        await service.bulkPublish(token, ids, status)
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}


const updateLectures = async (req, res) => {
    try {
        const { id } = req.params
        const token = req.headers.authorization?.split(' ')[1] ?? null
        const { lectures } = req.body
        await service.updateLectures(token, id, lectures)
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export { listPublished, listAdmin, createCourse, getCourse, updateCourse, deleteCourse, bulkDelete, bulkPublish, updateLectures };
