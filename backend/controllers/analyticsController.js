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
    const rawResponse = await getAIResponseWithRetry(model, comprehensivePrompt);

    // Calculate non-revenue KPIs locally for reliability
    const nonRevenueKPIs = calculateNonRevenueKPIs(bills, feedbacks);

    if (!rawResponse) {
      // AI model failed, return what we can
      return res.json({
        kpis: {
          ...nonRevenueKPIs,
          totalRevenueThisMonth: "0.00",
        },
        revenueOverTime: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        topItems: [],
        negativeKeywords: [],
        businessSummary: "AI analytics are temporarily unavailable. Please try again later.",
      });
    }

    // console.log('Raw AI Response:', rawResponse); // Log the raw response

    try {
      // The AI will return a single JSON object with all the data
      const analyticsData = JSON.parse(rawResponse);
      console.log('Parsed AI Response:', analyticsData);

      // Combine AI-generated KPIs with locally calculated ones
      const kpis = {
        ...nonRevenueKPIs,
        totalRevenueThisMonth: (analyticsData.totalRevenueThisMonth || 0).toFixed(2),
      };

      res.json({
        kpis,
        revenueOverTime: analyticsData.revenueOverTime || [],
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

const createComprehensivePrompt = (bills, feedbacks, revenues) => {
  const billContents = bills.map(b => b.content).join('\n---\n');
  const feedbackContents = feedbacks.map(f => f.content).join('\n---\n');
  // Pass revenue data with date context
  const revenueContents = revenues.map(r => `Date: ${new Date(r.upload_date).toISOString().split('T')[0]}, Amount: ${r.content}`).join('\n');
  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();

  return `\n    Analyze the following business data from a restaurant. Today is ${today.toDateString()}.\n    Return a single, valid JSON object with the following keys: "sentiment", "topItems", "negativeKeywords", "businessSummary", "revenueOverTime", "totalRevenueThisMonth".\n\n    1.  **sentiment**: Analyze the sentiment of the customer feedback. Return an object with keys "positive", "neutral", and "negative", representing the count of each sentiment.\n    2.  **topItems**: From the provided bills, identify the top 5 most frequently sold items. Return an array of objects, where each object has an "item" (string) and "count" (number).\n    3.  **negativeKeywords**: From the customer feedback, extract the most common phrases or keywords associated with negative experiences. Return an array of objects with "text" and "value" (frequency).\n    4.  **businessSummary**: Provide a concise 1-2 sentence summary of the business's performance based on all provided data.\n    5.  **revenueOverTime**: From the revenue data, calculate the total revenue for each of the last 5 calendar months (including the current month). Return an array of 5 objects, where each object has a "date" (formatted as the three-letter abbreviation of the month, e.g., "Aug") and "total" (number). Ensure all 5 months are present in chronological order, even if the revenue is 0.\n    6.  **totalRevenueThisMonth**: Calculate the total revenue for the current calendar month (${currentMonthName} ${currentYear}). Return a single number.\n\n    **DATA:**\n\n    **Bills:**\n    ${billContents}\n\n    **Feedback:**\n    ${feedbackContents}\n\n    **Revenue Data:**\n    ${revenueContents}\n\n    **IMPORTANT: Ensure the output is a single, valid JSON object with no extra text, comments, or formatting.\n\n    **JSON OUTPUT FORMAT EXAMPLE:**\n    {\n      "sentiment": { "positive": 15, "neutral": 5, "negative": 8 },\n      "topItems": [\n        { "item": "Margherita Pizza", "count": 25 },\n        { "item": "Caesar Salad", "count": 18 }\n      ],\n      "negativeKeywords": [\n        { "text": "slow service", "value": 5 }\n      ],\n      "businessSummary": "The restaurant is popular, but suffers from recurring issues with slow service.",\n      "revenueOverTime": [\n        { "date": "Apr 2025", "total": 1200.50 },\n        { "date": "May 2025", "total": 1500.75 },\n        { "date": "Jun 2025", "total": 1350.00 },\n        { "date": "Jul 2025", "total": 1800.25 },\n        { "date": "Aug 2025", "total": 2100.00 }\n      ],\n      "totalRevenueThisMonth": 2100.00\n    }\n  `;
};

// This function now only calculates non-revenue KPIs.
const calculateNonRevenueKPIs = (bills, feedbacks) => {
  const totalBillAmount = bills.reduce((sum, b) => {
    const match = b.content.match(/(?:TOTAL PAID|TOTAL|AMOUNT):\s*\$?\s*(\d+\.\d{2})/i);
    const billValue = match && match[1] ? parseFloat(match[1]) : 0;
    return sum + billValue;
  }, 0);
  const averageBillSize = bills.length > 0 ? totalBillAmount / bills.length : 0;

  return {
    averageBillSize: averageBillSize.toFixed(2),
    feedbackCount: feedbacks.length,
  };
};