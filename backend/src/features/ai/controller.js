import * as service from './service.js'

const summary = async (req, res) => {
    try {
        const { text } = req.body
        if (!text) return res.status(400).json({ error: 'text required' })
        const data = await service.generateSummary(text)
        res.json({ data })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export { summary };
