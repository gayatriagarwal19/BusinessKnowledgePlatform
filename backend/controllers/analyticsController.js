

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

    const kpis = calculateKPIs(revenues, bills, feedbacks);
    const revenueOverTime = calculateRevenueOverTime(revenues);

    // --- Consolidate all analysis into a single API call ---
    const comprehensivePrompt = createComprehensivePrompt(bills, feedbacks, revenues);
    const rawResponse = await getAIResponseWithRetry(model, comprehensivePrompt);

    if (!rawResponse) {
      // AI model failed, but we can still send the basic data
      return res.json({
        kpis,
        revenueOverTime,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        topItems: [],
        negativeKeywords: [],
        businessSummary: "AI analytics are temporarily unavailable. Please try again later.",
      });
    }

    console.log('Raw AI Response:', rawResponse); // Log the raw response

    try {
      // The AI will return a single JSON object with all the data
      const analyticsData = JSON.parse(rawResponse);
      console.log('Parsed AI Response:', analyticsData);

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
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      res.status(500).json({ msg: 'Failed to parse analytics data from AI model.', details: rawResponse });
    }

  } catch (err) {
    console.error('Error generating analytics summary:', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};

// --- Helper Functions ---

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getAIResponseWithRetry = async (model, prompt, retries = 3, delayMs = 1500) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return text; // Success
    } catch (e) {
      if (e.status === 503 && i < retries - 1) {
        console.warn(`AI model is overloaded. Retrying in ${delayMs / 1000}s... (Attempt ${i + 1}/${retries})`);
        await delay(delayMs);
      } else {
        console.error("Error communicating with the AI model after retries:", e);
        return null; // Failed after all retries or a non-retryable error
      }
    }
  }
  return null;
};

const createComprehensivePrompt = (bills, feedbacks, revenues) => {  const billContents = bills.map(b => b.content).join('\n---\n');  const feedbackContents = feedbacks.map(f => f.content).join('\n---\n');  return `    Analyze the following business data from a restaurant, including bills and customer feedback, and return a single, valid JSON object.

    The JSON object must have the following keys: "sentiment", "topItems", "negativeKeywords", and "businessSummary".

    1.  **sentiment**: Analyze the sentiment of the customer feedback. Return an object with keys "positive", "neutral", and "negative", representing the count of each sentiment.
    2.  **topItems**: From the provided bills, identify the top 5 most frequently sold items. Return an array of objects, where each object has an "item" (string) and "count" (number).
    3.  **negativeKeywords**: Analyze the customer feedback and extract the most common phrases or keywords associated with negative experiences. Return an array of objects, where each object has "text" (the negative phrase) and "value" (the frequency of that phrase). For example, if "slow service" appears multiple times, it should be one of the objects.
    4.  **businessSummary**: Provide a concise 1-2 sentence summary of the business's performance based on all the provided data.

    **DATA:**

    **Bills:**
    ${billContents}

    **Feedback:**
    ${feedbackContents}

    **IMPORTANT: Ensure the output is a single, valid JSON object with no extra text, comments, or formatting.

    **JSON OUTPUT FORMAT EXAMPLE:**
    {
      "sentiment": { "positive": 15, "neutral": 5, "negative": 8 },
      "topItems": [
        { "item": "Margherita Pizza", "count": 25 },
        { "item": "Caesar Salad", "count": 18 }
      ],
      "negativeKeywords": [
        { "text": "slow service", "value": 5 },
        { "text": "cold food", "value": 3 },
        { "text": "long wait", "value": 6 }
      ],
      "businessSummary": "The restaurant is popular, with high sales for key items, but suffers from recurring issues with slow service and food temperature."
    }
  `;
};



const calculateKPIs = (revenues, bills, feedbacks) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyRevenue = revenues
    .filter(r => new Date(r.upload_date) > oneWeekAgo)
    .reduce((sum, r) => sum + (parseFloat(r.content) || 0), 0);

  const totalBillAmount = bills.reduce((sum, b) => {
    // Regex to find a line like "TOTAL PAID: $42.99" and extract the amount
    const match = b.content.match(/(?:TOTAL PAID|TOTAL|AMOUNT):\s*\$?\s*(\d+\.\d{2})/i);
    const billValue = match && match[1] ? parseFloat(match[1]) : 0;
    return sum + billValue;
  }, 0);
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

