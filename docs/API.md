# API Documentation

This document provides a detailed overview of the RESTful API endpoints for the Enterprise Project backend.

## Base URL

`http://localhost:8000/api`

## Authentication

Most endpoints require a JSON Web Token (JWT) passed in the `Authorization` header using the `Bearer` scheme.

Example:
`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Auth Endpoints

### `POST /auth/register`
Registers a new user.

- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "msg": "User already exists"
  }
  ```

### `POST /auth/login`
Logs in an existing user and returns a JWT.

- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "msg": "Invalid credentials"
  }
  ```

### `GET /auth/profile`
Retrieves the authenticated user's profile and document counts.

- **Headers:** `Authorization: Bearer <token>` (required)
- **Success Response (200 OK):**
  ```json
  {
    "user": {
      "email": "user@example.com",
      "id": "60d5ec49f8c7a1b2c3d4e5f6"
    },
    "documentCounts": {
      "bills": 5,
      "feedback": 2,
      "revenue": 3
    }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "msg": "No token, authorization denied"
  }
  ```

### `PUT /auth/password`
Changes the authenticated user's password.

- **Headers:** `Authorization: Bearer <token>` (required)
- **Request Body:**
  ```json
  {
    "oldPassword": "oldpassword123",
    "newPassword": "newpassword456"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "msg": "Password updated successfully"
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "msg": "Incorrect old password"
  }
  ```

---

## Document Endpoints

### `POST /documents/upload`
Uploads a document (PDF, DOCX, TXT, MD, JPG, JPEG, PNG) and extracts its content.

- **Headers:** `Authorization: Bearer <token>` (required), `Content-Type: multipart/form-data`
- **Request Body:** `file` (FormData field containing the document file)
- **Success Response (200 OK):**
  ```json
  {
    "_id": "60d5ec49f8c7a1b2c3d4e5f7",
    "userId": "60d5ec49f8c7a1b2c3d4e5f6",
    "filename": "my_bill.pdf",
    "content": "Extracted text content of the document...",
    "type": "bill",
    "size": 123456,
    "upload_date": "2023-10-27T10:00:00.000Z",
    "createdAt": "2023-10-27T10:00:00.000Z",
    "updatedAt": "2023-10-27T10:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "msg": "No file uploaded."
  }
  ```
  ```json
  {
    "msg": "Unsupported file type. Allowed types are: PDF, DOCX, TXT, MD, JPG, JPEG, PNG"
  }
  ```
  ```json
  {
    "msg": "File size exceeds the 100MB limit."
  }
  ```

### `GET /documents`
Retrieves all documents for the authenticated user, with optional search.

- **Headers:** `Authorization: Bearer <token>` (required)
- **Query Parameters:**
  - `search` (optional): A string to search for in filenames or content.
- **Success Response (200 OK):**
  ```json
  [
    { /* Document Object 1 */ },
    { /* Document Object 2 */ }
  ]
  ```



---

## Analytics Endpoints

### `GET /analytics/summary`
Retrieves a summary of business analytics.

- **Headers:** `Authorization: Bearer <token>` (required)
- **Success Response (200 OK):**
  ```json
  {
    "kpis": {
      "totalRevenueThisWeek": "1234.56",
      "averageBillSize": "45.78",
      "feedbackCount": 10
    },
    "revenueOverTime": [
      { "date": "2023-10-20", "total": 150.00 },
      { "date": "2023-10-21", "total": 200.50 }
    ],
    "sentiment": {
      "positive": 8,
      "neutral": 1,
      "negative": 1
    },
    "topItems": [
      { "item": "Coffee", "count": 50 },
      { "item": "Sandwich", "count": 30 }
    ],
    "businessSummary": "A concise summary of business performance."
  }
  ```
- **Error Response (500 Internal Server Error):**
  ```json
  {
    "msg": "Server error"
  }
  ```
  ```json
  {
    "msg": "AI analytics are temporarily unavailable. Please try again later."
  }
  ```

---

## Chat Endpoints

### `POST /chat/message`
Sends a message to the AI chatbot and receives a response.

- **Headers:** `Authorization: Bearer <token>` (required)
- **Request Body:**
  ```json
  {
    "message": "Hello, what can you do?"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "response": "AI chatbot's response in Markdown format."
  }
  ```
- **Error Response (500 Internal Server Error):**
  ```json
  {
    "msg": "Server error"
  }
  ```
