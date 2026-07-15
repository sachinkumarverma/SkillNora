import fetch from "node-fetch";

const summarize = async (text, key) => {
  const body = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that summarizes text concisely.",
      },
      {
        role: "user",
        content: `Summarize the following content in 3-5 bullet points:\n\n${text}`,
      },
    ],
    max_tokens: 250,
    temperature: 0.2,
  };

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) throw new Error(await r.text());
  return await r.json();
};

const chat = async (messages, key, courseContext = "", options = {}) => {
  let systemMessage = {
    role: "system",
    content:
      `You are Askie, Skillnora's intelligent AI learning assistant. Be very friendly, concise, and helpful. You MUST ONLY recommend courses from the Skillnora platform. Do NOT recommend external courses or platforms.\n\nHere are the current courses available on Skillnora:\n${courseContext}`,
  };

  // If a system message is passed in the messages array, use it as the override
  const passedSystemMessage = messages.find((m) => m.role === "system");
  
  if (options.systemPromptOverride) {
    systemMessage = { role: "system", content: options.systemPromptOverride };
  } else if (passedSystemMessage) {
    systemMessage = { role: "system", content: passedSystemMessage.content };
  }

  // Filter out any system messages from the input since we will prepend our final systemMessage
  const filteredMessages = messages.filter(m => m.role !== 'system');

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: options.model || "llama-3.1-8b-instant",
      messages: [systemMessage, ...filteredMessages],
      response_format: options.useJsonFormat ? { type: "json_object" } : undefined,
      max_tokens: options.maxTokens || undefined,
    }),
  });

  if (!r.ok) throw new Error(await r.text());
  return await r.json();
};

export const aiService = {
  summarize,
  chat,
};
