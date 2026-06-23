import fetch from 'node-fetch';

const summarize = async (text, key) => {
  const body = {
    model: 'llama-3.1-8b-instant',
    messages: [{
      role: 'system',
      content: 'You are a helpful assistant that summarizes text concisely.'
    }, {
      role: 'user',
      content: `Summarize the following content in 3-5 bullet points:\n\n${text}`
    }],
    max_tokens: 250,
    temperature: 0.2
  };
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
};

const chat = async (messages, key) => {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'system',
        content: "You are Askie, Skillnora's intelligent AI learning assistant. Be very friendly, concise, and helpful."
      }, ...messages]
    })
  });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
};

export const aiService = {
  summarize,
  chat
};