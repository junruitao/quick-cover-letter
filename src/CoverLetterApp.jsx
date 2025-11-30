import React, { useState, useEffect, useCallback, useRef } from 'react';

// NOTE: Firebase/Firestore imports have been removed per user request
// to use localStorage for client-side persistence instead.

// --- CONFIGURATION ---
// !!! IMPORTANT !!! REPLACE THIS PLACEHOLDER WITH YOUR ACTUAL DEPLOYED CLOUD RUN URL
const CLOUD_RUN_API_URL = "https://cover-letter-generator-310631449500.australia-southeast1.run.app/generate"; 
const DEBOUNCE_DELAY = 1000; // Delay for saving inputs to localStorage (1 second)

// Initial state for the input fields
const initialInputs = {
    resume_url: '',
    job_description_url: '',
    word_count: 300,
};

// Main App Component
const App = () => {
    const [inputs, setInputs] = useState(initialInputs);
    const [coverLetter, setCoverLetter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce Ref for saving inputs
    const debounceRef = useRef(null);

    // --- 1. LOCAL STORAGE PERSISTENCE: SAVE ---
    // Function to save current inputs to browser's local storage
    const saveInputsToLocalStorage = useCallback((currentInputs) => {
        try {
            const inputsToSave = {
                ...currentInputs,
                word_count: Number(currentInputs.word_count)
            };
            localStorage.setItem('coverLetterInputs', JSON.stringify(inputsToSave));
        } catch (e) {
            console.error("Error saving inputs to localStorage:", e);
        }
    }, []);

    // --- 2. LOCAL STORAGE PERSISTENCE: LOAD ---
    // Load inputs from local storage on initial component mount
    useEffect(() => {
        const savedInputs = localStorage.getItem('coverLetterInputs');
        if (savedInputs) {
            try {
                const parsedInputs = JSON.parse(savedInputs);
                setInputs(prev => ({
                    ...prev, 
                    ...parsedInputs, 
                    // Ensure word_count is handled as a number
                    word_count: Number(parsedInputs.word_count) || 300
                }));
            } catch (e) {
                console.error("Error parsing saved inputs from localStorage:", e);
                // Fallback to initial state if parsing fails
            }
        }
    }, []);


    // --- 3. INPUT HANDLING & DEBOUNCED SAVE ---
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        
        let newValue = value;
        if (name === 'word_count') {
            // Apply bounds check for word count
            newValue = Math.max(50, Math.min(1000, parseInt(value, 10) || 50));
        }

        setInputs(prev => {
            const updatedInputs = { ...prev, [name]: newValue };
            
            // Debounce the saving action
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                saveInputsToLocalStorage(updatedInputs);
            }, DEBOUNCE_DELAY);

            return updatedInputs;
        });
    }, [saveInputsToLocalStorage]);


    // --- 4. CLOUD RUN API CALL ---
    const handleGenerate = async () => {
        if (!inputs.resume_url || !inputs.job_description_url) {
            setError("Please provide both Resume URL and Job Description URL.");
            return;
        }

        if (CLOUD_RUN_API_URL.includes("YOUR-CLOUD-RUN-URL")) {
            setError("Configuration Error: Please update CLOUD_RUN_API_URL with your actual deployed URL.");
            return;
        }

        setLoading(true);
        setError(null);
        setCoverLetter(null);

        try {
            const response = await fetch(CLOUD_RUN_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputs),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || `HTTP Error ${response.status}: Failed to generate letter.`);
            }

            setCoverLetter(data.cover_letter);

        } catch (err) {
            console.error("API Call Error:", err);
            if (err.message.includes("Gemini API Client is not initialized")) {
                // Specific error handling for the backend configuration issue
                setError(`Server Error: The Cloud Run service failed due to a missing or invalid GEMINI_API_KEY environment variable. Please check your deployment settings.`);
            } else {
                setError(`Generation Failed: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };


    // --- 5. RENDER UI ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-blue-800">Gemini-Powered Cover Letter Generator</h1>
                <p className="text-gray-600 mt-1">Fetch content from URLs and generate tailored letters using AI.</p>
                <p className="text-xs text-gray-500 mt-2">
                    Data persistence is handled via **browser local storage**.
                </p>
            </header>

            <main className="max-w-4xl mx-auto">
                {/* Input Panel */}
                <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 border border-blue-100">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">1. Input Sources & Constraints</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputGroup 
                            label="Resume URL (Text/PDF/DOC)" 
                            name="resume_url" 
                            value={inputs.resume_url} 
                            onChange={handleInputChange} 
                            type="url"
                            placeholder="e.g., https://my.storage.com/resume.txt"
                        />
                        <InputGroup 
                            label="Job Description URL (HTML)" 
                            name="job_description_url" 
                            value={inputs.job_description_url} 
                            onChange={handleInputChange} 
                            type="url"
                            placeholder="e.g., https://www.seek.com.au/job/..."
                        />
                        <InputGroup 
                            label="Target Word Count" 
                            name="word_count" 
                            value={inputs.word_count} 
                            onChange={handleInputChange} 
                            type="number"
                            min={50}
                            max={1000}
                        />
                    </div>
                    
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading || !inputs.resume_url || !inputs.job_description_url || CLOUD_RUN_API_URL.includes("YOUR-CLOUD-RUN-URL")}
                        className={`mt-6 w-full py-3 rounded-lg font-bold text-lg transition duration-200 ease-in-out shadow-lg 
                            ${loading || CLOUD_RUN_API_URL.includes("YOUR-CLOUD-RUN-URL") ? 'bg-blue-300 text-blue-100 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl active:bg-blue-800'}`
                        }
                    >
                        {loading ? 'Generating Letter...' : 'Generate Cover Letter'}
                    </button>
                    
                </div>
                
                {/* Status and Output Panel */}
                <div className="bg-white p-6 rounded-xl shadow-2xl border border-blue-100">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">2. Generated Output</h2>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow-inner">
                            <p className="font-semibold">Error:</p>
                            <pre className="whitespace-pre-wrap text-sm mt-1">{error}</pre>
                        </div>
                    )}
                    
                    {/* Loading Indicator (if error is cleared and we are generating) */}
                    {loading && !coverLetter && (
                        <div className="flex items-center justify-center p-12 text-blue-500">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className='font-medium'>AI is crafting your perfect letter...</span>
                        </div>
                    )}

                    {/* Cover Letter Output */}
                    {coverLetter && (
                        <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg shadow-inner whitespace-pre-wrap leading-relaxed text-gray-800">
                            {coverLetter}
                        </div>
                    )}

                    {!loading && !coverLetter && !error && (
                        <div className="p-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-lg">
                            Your cover letter will appear here after generation.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// Helper component for styled input fields
const InputGroup = ({ label, name, value, onChange, type = 'text', ...props }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-100 disabled:text-gray-500"
            {...props}
        />
    </div>
);


export default App;