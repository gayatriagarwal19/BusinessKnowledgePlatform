# Technology Choices

This document outlines the key technology choices made for the Enterprise Project and provides the rationale behind these decisions.

## Frontend Technologies

-   **React**: Chosen for building the user interface due to its component-based architecture, large ecosystem, strong community support, and declarative approach to UI development. It allows for efficient and scalable single-page applications.
    -   *Alternatives Considered*: Vue.js, Angular. React's flexibility and widespread adoption in the industry were key factors.

-   **Redux Toolkit**: Selected for state management in the React application. It simplifies Redux development by providing utilities to reduce boilerplate code and enforce best practices. It integrates well with React and helps manage complex application states predictably.
    -   *Alternatives Considered*: React Context API, Zustand, MobX. Redux Toolkit was chosen for its robustness, scalability for larger applications, and built-in immutability handling.

-   **Axios**: A promise-based HTTP client for making API requests from the frontend. It offers a straightforward API, automatic JSON transformation, and good error handling capabilities.
    -   *Alternatives Considered*: Fetch API. Axios provides a more convenient and feature-rich experience out-of-the-box.

-   **Tailwind CSS**: A utility-first CSS framework chosen for rapid UI development and consistent styling. It allows for highly customizable designs directly in the markup without writing custom CSS, promoting maintainability and reducing CSS bloat.
    -   *Alternatives Considered*: Bootstrap, Material-UI. Tailwind's flexibility and focus on utility classes aligned better with the desire for a custom, modern aesthetic.

-   **Recharts**: A composable charting library built with React and D3. It was chosen for its ease of integration with React components, flexibility in creating various chart types, and good documentation, enabling clear visualization of analytics data.
    -   *Alternatives Considered*: Chart.js. Recharts offered a good balance of features and React-native integration.

-   **React Hot Toast**: A lightweight and easy-to-use toast notification library. Chosen for its simplicity, good looks, and non-intrusive way of providing user feedback for actions like file uploads or login messages.

-   **`browser-image-compression`**: A JavaScript library for client-side image compression. Integrated to reduce the file size of image uploads (JPG, JPEG, PNG) before sending them to the server, thereby improving upload speed and reducing bandwidth usage.

## Backend Technologies

-   **Node.js**: Chosen as the runtime environment for the backend due to its non-blocking, event-driven architecture, which makes it highly efficient for I/O-bound operations typical of web servers. Its JavaScript-based nature allows for full-stack JavaScript development.

-   **Express.js**: A fast, minimalist web framework for Node.js. It was selected for its flexibility, extensive middleware ecosystem, and simplicity in building RESTful APIs.

-   **MongoDB**: A NoSQL document database. Chosen for its flexibility in schema design, scalability, and ease of integration with Node.js applications using Mongoose. It's well-suited for handling diverse document types and rapidly evolving data structures.
    -   *Alternatives Considered*: PostgreSQL, MySQL. MongoDB's document-oriented nature was a good fit for storing varied document content.

-   **Mongoose**: An elegant MongoDB object modeling tool for Node.js. It provides a straightforward, schema-based solution to model application data, offering strong validation, type casting, and query building capabilities.

-   **`bcryptjs`**: A library for hashing passwords. Chosen for its strong cryptographic hashing capabilities, ensuring secure storage of user passwords.

-   **`jsonwebtoken`**: A library for implementing JSON Web Tokens (JWT). Used for secure, stateless authentication between the client and server.

-   **Multer**: A Node.js middleware for handling `multipart/form-data`, primarily used for file uploads. Chosen for its ease of use and ability to handle files in memory, avoiding disk I/O for temporary storage.

-   **`pdf-parse`**: A Node.js module to extract text from PDF files. Selected for its ability to extract selectable text content from PDFs.

-   **`mammoth`**: A Node.js library for converting `.docx` documents to HTML or plain text. Chosen for its effectiveness in extracting content from Word documents.

-   **Tesseract.js**: A pure JavaScript port of the Tesseract OCR engine. Integrated for performing Optical Character Recognition (OCR) on image files (JPG, JPEG, PNG) to extract text content, enabling searchability and analysis of image-based documents.

## LLM Integration

-   **Google Generative AI (Gemini API)**: Chosen for its advanced natural language understanding and generation capabilities. It provides powerful models suitable for tasks like summarization, sentiment analysis, and conversational AI. Its ease of integration and Google's ongoing development in AI were key factors.
    -   *Specific Models Used*: `gemini-1.5-flash` (for analytics summarization due to its efficiency and speed) and `gemini-pro` (for the chatbot for its conversational abilities).