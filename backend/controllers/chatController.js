const Document = require('../models/document'); // Assuming chat will interact with documents
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn("GEMINI_API_KEY not found. Chat functionality will be disabled.");
}

exports.sendMessage = async (req, res) => {
  console.log('Received chat message request.');
  if (!genAI) {
    console.error('GEMINI_API_KEY not configured.');
    return res.status(503).json({ error: "Chat functionality is disabled. Please configure GEMINI_API_KEY." });
  }

  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    const { message } = req.body;
    const userId = req.user.id; // Assuming authMiddleware attaches user ID
    console.log(`User ID: ${userId}, Message: ${message}`);

    // Fetch documents for the current user
    const userDocuments = await Document.find({ userId });

    let context = "";
    if (userDocuments.length > 0) {
      context = userDocuments.map(doc => `Filename: ${doc.filename}\nContent: ${doc.content}`).join("\n\n---\n\n");
    } else {
      context = "No documents available for context.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = `Given the following context (if any):\n\n${context}\n\nQuestion: ${message}\n\nAnswer:`;

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ reply: chunkText })}\n\n`);
      }
    }
    res.end(); // End the stream when done

  } catch (err) {
    console.error('Error sending message to Gemini:', err);
    // Send an error event to the client
    res.write(`event: error\ndata: ${JSON.stringify({ msg: err.message || 'Server error' })}\n\n`);
    res.end();
  }
};