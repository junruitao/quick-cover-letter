import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './CoverLetterApp.jsx'; // Import the main application component

// Get the root element from public/index.html
const container = document.getElementById('root');

if (container) {
    // Create the root and render the App component
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Failed to find the root element to mount the React application.');
}