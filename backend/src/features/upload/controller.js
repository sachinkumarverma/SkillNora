import * as service from './service.js'

const getSignedUrl = async (req, res) => {
    try {
        const { bucket, filePath } = req.body
        if (!filePath) return res.status(400).json({ error: 'filePath required' })
        const data = await service.getSignedUrl(bucket || 'course-thumbnails', filePath)
        res.json(data)
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export { getSignedUrl };
