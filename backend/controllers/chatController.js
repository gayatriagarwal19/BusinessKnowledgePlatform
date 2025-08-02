const Document = require('../models/document'); // Assuming chat will interact with documents
const { OpenAI } = require('openai');

let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("OPENAI_API_KEY not found. Chat functionality will be disabled.");
}


exports.sendMessage = async (req, res) => {
  if (!openai) {
    return res.status(503).json({ error: "Chat functionality is disabled. Please configure OPENAI_API_KEY." });
  }
  try {
    const { message } = req.body;
    // In a real application, you would fetch relevant document chunks here
    // based on the user's message and pass them to the LLM.
    const prompt = `Given the following context (if any):

[CONTEXT_PLACEHOLDER]

Question: ${message}

Answer:`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4', // Or gpt-3.5-turbo, depending on your OpenAI plan
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};