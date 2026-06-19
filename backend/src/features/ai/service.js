import fetch from 'node-fetch'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })

const OPENAI_BASE = 'https://api.openai.com/v1'

const generateSummary = async (text) => {
    const key = process.env.OPENAI_API_KEY || ''
    if (!key) {
        // Dev fallback: make a naive summary by splitting sentences
        const sentences = text.split(/[.!?]\s+/).filter(Boolean)
        const bullets = sentences.slice(0, 5).map(s => s.trim()).filter(Boolean)
        return { choices: [{ message: { content: bullets.map((b, i) => `- ${b}`).join('\n') } }] }
    }

    const body = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a helpful assistant that summarizes text concisely.' }, { role: 'user', content: `Summarize the following content in 3-5 bullet points:\n\n${text}` }],
        max_tokens: 250,
        temperature: 0.2
    }
    
    const res = await fetch(`${OPENAI_BASE}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body) })
    if (!res.ok) {
        const txt = await res.text()
        console.warn('OpenAI API error, falling back to local summary', res.status, txt)
        // fallback to naive summary
        const sentences = text.split(/[.!?]\s+/).filter(Boolean)
        const bullets = sentences.slice(0, 5).map(s => s.trim()).filter(Boolean)
        return { choices: [{ message: { content: bullets.map((b) => `- ${b}`).join('\n') } }] }
    }
    const data = await res.json()
    return data
}

export default { generateSummary }


export { generateSummary };
