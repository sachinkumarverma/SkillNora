const OPENAI_BASE = 'https://api.openai.com/v1'

export async function generateSummary(text: string) {
    const key = process.env.OPENAI_API_KEY || ''
    if (!key) throw new Error('OPENAI_API_KEY not configured')

    const body = {
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are a helpful assistant that summarizes text concisely.' },
            { role: 'user', content: `Summarize the following content in 3-5 bullet points:\n\n${text}` }
        ],
        max_tokens: 250,
        temperature: 0.2
    }

    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`
        },
        body: JSON.stringify(body)
    })

    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`OpenAI error: ${res.status} ${txt}`)
    }

    const data = await res.json()
    return data
}

export default { generateSummary }
