# Gemini-Powered Cover Letter Generator (React Frontend)

This is the frontend for a web application that generates tailored cover letters using Google's Gemini AI. The application fetches content from a user's resume and a job description (either from a URL or pasted text), sends it to a backend service running on Google Cloud Run, and displays the AI-generated cover letter.

The app is built with React and styled with Tailwind CSS. It features robust Google Analytics tracking, including a fallback mechanism using the Measurement Protocol to ensure critical conversion events are captured.

![Cover Letter Generator Screenshot](https://user-images.githubusercontent.com/your-github-id/your-repo/path/to/screenshot.png) 
*(Note: You should replace the image link above with a screenshot of your application.)*

## ✨ Features

- **Dynamic Content Sourcing**: Accepts URLs for resumes and job descriptions, automatically scraping their content on the backend.
- **Flexible Input**: Users can either provide a URL for a job description or paste the text directly.
- **Customizable Output**: Specify a target word count for the generated letter.
- **State Persistence**: All inputs are automatically saved to the browser's `localStorage` and reloaded on the next visit.
- **Responsive UI**: Clean, responsive interface built with React and Tailwind CSS.
- **Copy to Clipboard**: Easily copy the generated cover letter with a single click.
- **Advanced Analytics**:
  - Integrates with Google Analytics 4 (GA4).
  - Uses `gtag.js` for standard client-side event tracking.
  - Implements a Measurement Protocol fallback to send critical events (like successful generation and copy actions) directly from the client to Google's servers, bypassing potential ad-blockers.
- **Clear User Feedback**: Provides loading states, error messages, and success indicators.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS
- **Analytics**: Google Analytics 4 (with `gtag.js` and Measurement Protocol)
- **Deployment Target (Backend)**: Google Cloud Run
- **Core AI**: Google Gemini (via backend API)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14 or later)
- npm, yarn, or pnpm
- A deployed backend service on Google Cloud Run (or another host) that this frontend can call.
- A Google Analytics 4 Property with a Measurement ID and a Measurement Protocol API Secret.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configuration

This project requires you to configure several constants directly in the `src/CoverLetterApp.jsx` file. For a production setup, it is highly recommended to move these into environment variables (e.g., using `.env` files).

Open `src/CoverLetterApp.jsx` and update the following placeholder values:

```javascript
// --- CONFIGURATION ---

// 1. Replace with the URL of your deployed backend API
const CLOUD_RUN_API_URL = "https://your-backend-service-url.run.app/generate"; 

// 2. Replace with your GA4 Measurement ID
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; 

// 3. CRITICAL: Replace with your Measurement Protocol API Secret
// This is required for the analytics fallback mechanism.
const GA_MP_API_SECRET = "YourSecretValueFromGA"; 
```

**How to get Google Analytics credentials:**
1.  **`GA_MEASUREMENT_ID`**: In your GA4 property, go to `Admin` > `Data Streams`, select your web stream, and find the "Measurement ID".
2.  **`GA_MP_API_SECRET`**: In the same Data Stream settings, go to `Measurement Protocol` > `API secrets` and create a new secret.

> **⚠️ Security Warning:** The `GA_MP_API_SECRET` is sensitive. Exposing it client-side is a security risk, as it could be abused. For a production application, the recommended approach is to have the client send an event to your *own* backend, which then securely forwards it to the Measurement Protocol endpoint. This code implements the direct client-to-GA approach for simplicity.

### 4. Run the Development Server

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

### 5. Build for Production

To create a production-ready build:

```bash
npm run build
# or
yarn build
```

This will create an optimized `build` folder that you can deploy to any static site hosting service (like Vercel, Netlify, or Firebase Hosting).

## 📈 Analytics Events

The application tracks the following key user interactions:

- `app_load`: Fired when the application is first loaded.
- `generate_attempt`: Fired when the "Generate" button is clicked, includes a `success` parameter.
- `generation_success` / `generation_success_mp`: Fired when a cover letter is successfully generated.
- `generation_failure`: Fired when the API call fails.
- `letter_copied` / `letter_copied_mp`: Fired when the user copies the generated letter.

Events with an `_mp` suffix are sent via the Measurement Protocol as a reliable fallback.
