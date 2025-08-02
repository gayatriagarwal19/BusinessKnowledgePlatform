const Document = require('../models/document'); // Assuming chat will interact with documents
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn("GEMINI_API_KEY not found. Chat functionality will be disabled.");
}

exports.sendMessage = async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: "Chat functionality is disabled. Please configure GEMINI_API_KEY." });
  }
  try {
    const { message } = req.body;
    const userId = req.user.id; // Assuming authMiddleware attaches user ID

    // Fetch documents for the current user
    const userDocuments = await Document.find({ userId });

    let context = "";
    if (userDocuments.length > 0) {
      context = userDocuments.map(doc => `Filename: ${doc.filename}\nContent: ${doc.content}`).join("\n\n---\n\n");
    } else {
      context = "No documents available for context.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = `Given the following context (if any):

${context}

Question: ${message}

Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error('Error sending message to Gemini:', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};