# Enterprise Project

This is a comprehensive enterprise application designed to manage documents, provide analytics, and offer AI-powered chatbot assistance.

## Features

- User Authentication (Registration, Login, Profile with Password Change)
- Document Management (Upload, View, Search)
- Support for various document types (PDF, DOCX, TXT, MD, JPG, JPEG, PNG)
- Text extraction from documents, including OCR for images
- Analytics Dashboard (KPIs, Revenue Over Time, Feedback Sentiment)
- AI Chatbot for assistance and context retrieval from relevant documents

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm (Node Package Manager)
- MongoDB (local or cloud instance)
- Google Gemini API Key (for AI functionalities)

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory with the following variables:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    GEMINI_API_KEY=your_google_gemini_api_key
    ```
    *Replace placeholders with your actual values.*

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  No `.env` file needed for frontend as it communicates with the backend.

## Running the Application

### Start Backend Server

From the `backend` directory:
```bash
npm start
```
(or `node index.js`)

### Start Frontend Development Server

From the `frontend` directory:
```bash
npm start
```

The frontend application will typically open in your browser at `http://localhost:3000`.

## Key Technologies

- **Frontend**: React, Redux Toolkit, Axios, Tailwind CSS, Recharts, React Hot Toast, Browser Image Compression
- **Backend**: Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, multer, pdf-parse, mammoth, Tesseract.js, Google Generative AI
- **Database**: MongoDB

## Folder Structure

```
.gitignore
backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── .env
├── index.js
├── package.json
└── ...
frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   └── utils/
├── package.json
└── ...
docs/
├── API.md
├── ARCHITECTURE.md
├── TECHNOLOGY_CHOICES.md
└── LLM_USE.md
```
