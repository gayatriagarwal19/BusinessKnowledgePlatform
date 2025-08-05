# LLM Use in Enterprise Project

This document details where and how Large Language Models (LLMs) are integrated into the Enterprise Project application.

## LLM Provider

**Google Generative AI (Gemini API)** is the primary LLM provider used in this project.

## Areas of LLM Integration

LLMs are utilized in two main areas of the application:

### 1. Analytics Dashboard Summary

-   **Purpose**: To provide a concise, AI-generated business summary, sentiment analysis of feedback, and extraction of common negative feedback phrases.
-   **Backend Component**: `backend/controllers/analyticsController.js`
-   **LLM Model Used**: `gemini-1.5-flash`
    -   **Rationale**: Chosen for its efficiency, speed, and cost-effectiveness, making it suitable for generating summaries and extracting structured data from provided text.
-   **Input to LLM (Prompt)**:
    -   The prompt is dynamically constructed within the `createComprehensivePrompt` function.
    -   It includes concatenated content from `bill` documents and `feedback` documents.
    -   Specific instructions are given to the AI to return a single JSON object with keys for `sentiment`, `topItems`, `negativeKeywords`, and `businessSummary`.
    -   Detailed examples of the expected JSON output format are provided in the prompt to guide the AI's response structure.
-   **Output from LLM**: The AI returns a JSON string containing the requested analytics data. This string is then parsed by the backend.
-   **Processing of LLM Output**: The parsed JSON data is used to populate the analytics dashboard. KPIs and revenue over time are calculated locally for reliability, while sentiment, top items, negative keywords, and the business summary are directly from the AI.
-   **Fallback Mechanism**: If the AI model is unavailable or fails to respond after retries, the system provides a partial analytics summary (KPIs, revenue over time) and a message indicating that AI analytics are temporarily unavailable. This ensures the application remains functional even without the LLM.

### 2. AI Chatbot

-   **Purpose**: To provide interactive, conversational assistance to users based on their queries.
-   **Backend Component**: `backend/controllers/chatController.js`
-   **LLM Model Used**: `gemini-pro`
    -   **Rationale**: Chosen for its strong conversational capabilities, general knowledge, and ability to maintain context over multiple turns.
-   **Input to LLM (Prompt)**:
    -   User messages are sent to the AI.
    -   The prompt includes the current user message and potentially a history of previous messages to maintain conversation context.
    -   System instructions might be included to guide the chatbot's persona or response style.
-   **Output from LLM**: The AI returns a text response, often in Markdown format.
-   **Processing of LLM Output**: The raw text response from the AI is sent to the frontend. The frontend (`Chatbot.js`) uses the `react-markdown` library to render this Markdown text into formatted HTML for display in the chat interface.

## Considerations for LLM Usage

-   **Latency**: AI requests introduce latency. Retries and asynchronous processing are implemented to manage this. For the chatbot, streaming responses could be considered for a better user experience.
-   **Cost**: The number of AI requests and the amount of data processed (token usage) directly impact costs. Strategies like caching for analytics and efficient prompt engineering are employed to mitigate this.
-   **Prompt Engineering**: Prompts are carefully crafted to elicit the desired structured output for analytics and relevant, helpful responses for the chatbot. Clear instructions and examples are crucial.
-   **Error Handling**: Robust error handling is implemented to manage cases where the LLM service is unavailable or returns unexpected responses, ensuring application stability.
-   **Data Privacy**: No sensitive user data is directly sent to the LLM without explicit user consent or anonymization. Only relevant document content or chat messages are used for AI processing.
