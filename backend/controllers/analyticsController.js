

const Document = require('../models/document');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper function to initialize Gemini AI
const initializeGenAI = () => {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  console.warn('GEMINI_API_KEY not found. Analytics functionality will be limited.');
  return null;
};

const genAI = initializeGenAI();

// Main controller function for getting the analytics summary
exports.getSummary = async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ msg: 'Analytics functionality is limited. Please configure GEMINI_API_KEY.' });
  }

  try {
    const userId = req.user.id;
    const documents = await Document.find({ userId });

    const bills = documents.filter(doc => doc.type === 'bill');
    const feedbacks = documents.filter(doc => doc.type === 'feedback');
    const revenues = documents.filter(doc => doc.type === 'revenue');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // --- Consolidate all analysis into a single API call ---
    const comprehensivePrompt = createComprehensivePrompt(bills, feedbacks, revenues);
    const rawResponse = await getAIResponse(model, comprehensivePrompt);

    if (!rawResponse) {
      return res.status(500).json({ msg: 'Failed to get a response from the AI model.' });
    }

    // The AI will return a single JSON object with all the data
    const analyticsData = JSON.parse(rawResponse);

    // We still calculate KPIs and revenue over time locally as it's more reliable
    const kpis = calculateKPIs(revenues, bills, feedbacks);
    const revenueOverTime = calculateRevenueOverTime(revenues);

    res.json({
      kpis,
      revenueOverTime,
      sentiment: analyticsData.sentiment,
      topItems: analyticsData.topItems,
      negativeKeywords: analyticsData.negativeKeywords,
      businessSummary: analyticsData.businessSummary,
    });

  } catch (err) {
    console.error('Error generating analytics summary:', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};

// --- Helper Functions ---

const createComprehensivePrompt = (bills, feedbacks, revenues) => {
  const billContents = bills.map(b => b.content).join('\n---\n');
  const feedbackContents = feedbacks.map(f => f.content).join('\n---\n');

  return `
    Analyze the following business data and return a single, valid JSON object.
    The JSON object should have the following keys: "sentiment", "topItems", "negativeKeywords", "businessSummary".

    1.  **sentiment**: An object with keys "positive", "neutral", and "negative", showing the count of each sentiment from the feedback.
    2.  **topItems**: An array of the top 5 selling items from the bills. Each item should be an object with "item" and "count".
    3.  **negativeKeywords**: An array of the most common negative feedback phrases. Each phrase should be an object with "text" and "value" (frequency).
    4.  **businessSummary**: A concise 1-2 sentence summary of the business based on all the data.

    **DATA:**
    Bills:
    ${billContents}

    Feedback:
    ${feedbackContents}

    **JSON OUTPUT FORMAT:**
    {
      "sentiment": { "positive": 0, "neutral": 0, "negative": 0 },
      "topItems": [ { "item": "Example Item", "count": 5 } ],
      "negativeKeywords": [ { "text": "Example Phrase", "value": 3 } ],
      "businessSummary": "Example summary."
    }
  `;
};

const getAIResponse = async (model, prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().replace(/```json\n|```/g, '').trim();
  } catch (e) {
    console.error("Error communicating with the AI model:", e);
    return null;
  }
};

const calculateKPIs = (revenues, bills, feedbacks) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyRevenue = revenues
    .filter(r => new Date(r.upload_date) > oneWeekAgo)
    .reduce((sum, r) => sum + (parseFloat(r.content) || 0), 0);

  const totalBillAmount = bills.reduce((sum, b) => sum + (parseFloat(b.content) || 0), 0);
  const averageBillSize = bills.length > 0 ? totalBillAmount / bills.length : 0;

  return {
    totalRevenueThisWeek: weeklyRevenue.toFixed(2),
    averageBillSize: averageBillSize.toFixed(2),
    feedbackCount: feedbacks.length,
  };
};

const calculateRevenueOverTime = (revenues) => {
  if (revenues.length === 0) return [];
  const revenueByDate = revenues.reduce((acc, r) => {
    const date = new Date(r.upload_date).toISOString().split('T')[0]; // Group by day
    acc[date] = (acc[date] || 0) + (parseFloat(r.content) || 0);
    return acc;
  }, {});

  return Object.entries(revenueByDate)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

