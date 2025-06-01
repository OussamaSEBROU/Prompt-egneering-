import React, { useState } from 'react';

// Main App component
const App = () => {
    // State for the user's initial prompt
    const [userPrompt, setUserPrompt] = useState('');

    // States for the answers to the 5 specific questions
    const [q1GoalOutput, setQ1GoalOutput] = useState(''); // New: Goal of the prompt & output type
    const [q2Audience, setQ2Audience] = useState('');     // New: Intended audience
    const [q3ModelTool, setQ3ModelTool] = useState('');   // New: Model or tool to be used
    const [q4ToneStyle, setQ4ToneStyle] = useState('');   // New: Tone or style preferences
    const [q5Constraints, setQ5Constraints] = useState(''); // New: Constraints or must-haves

    // State to hold the optimized prompt returned by the LLM
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    // State to manage the loading status during API calls
    const [isLoading, setIsLoading] = useState(false);
    // State to hold any error messages
    const [error, setError] = useState(null);
    // State for copy feedback message
    const [copyFeedback, setCopyFeedback] = useState('');

    // Function to handle prompt optimization
    const optimizePrompt = async () => {
        setIsLoading(true); // Set loading to true when optimization starts
        setError(null);     // Clear any previous errors
        setOptimizedPrompt(''); // Clear previous optimized prompt
        setCopyFeedback(''); // Clear any previous copy feedback

        // Construct the prompt for the LLM to act as a prompt engineer,
        // now including the 5 specific answers and a conciseness instruction.
        const llmPrompt = `You are an expert prompt engineer. Your task is to take a user's raw prompt and additional contextual information, then optimize the prompt for clarity, specificity, and effectiveness when used with a large language model. The optimized prompt should be concise, actionable, and directly usable by another AI, without any introductory or concluding remarks from you, just the optimized prompt itself.

Here is the user's original prompt:
'${userPrompt}'

Here is additional context provided by the user through 5 key questions:
1. Goal of the prompt & Expected Output: ${q1GoalOutput || 'Not specified'}
2. Intended Audience: ${q2Audience || 'Not specified'}
3. Model or Tool to be Used: ${q3ModelTool || 'Not specified'}
4. Tone or Style Preferences: ${q4ToneStyle || 'Not specified'}
5. Constraints or Must-Haves: ${q5Constraints || 'Not specified'}

Please provide ONLY the optimized prompt, without any conversational text or explanation.`;

        // Prepare the payload for the Gemini API call
        const payload = {
            contents: [{ role: "user", parts: [{ text: llmPrompt }] }],
        };

        // Define the API key (empty string for Canvas environment)
        const apiKey = ""; // Canvas will automatically provide this in runtime

        // Define the API URL for gemini-2.0-flash
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            // Make the API call to the Gemini model
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Check if the response was successful
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();

            // Extract the optimized prompt from the API response
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setOptimizedPrompt(text.trim()); // Trim any leading/trailing whitespace
            } else {
                setError("Could not retrieve optimized prompt. Unexpected API response structure.");
            }
        } catch (err) {
            console.error("Error optimizing prompt:", err);
            setError(`Failed to optimize prompt: ${err.message}`);
        } finally {
            setIsLoading(false); // Set loading to false after completion (success or error)
        }
    };

    // Function to handle copying the optimized prompt to clipboard
    const handleCopy = () => {
        if (optimizedPrompt) {
            try {
                // Create a temporary textarea element
                const textarea = document.createElement('textarea');
                textarea.value = optimizedPrompt;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy'); // Use execCommand for broader compatibility in iframes
                document.body.removeChild(textarea);

                setCopyFeedback('Copied!');
                setTimeout(() => setCopyFeedback(''), 2000); // Clear feedback after 2 seconds
            } catch (err) {
                console.error('Failed to copy text: ', err);
                setCopyFeedback('Failed to copy!');
                setTimeout(() => setCopyFeedback(''), 2000);
            }
        }
    };

    // Determine if the follow-up questions should be shown
    const showQuestions = userPrompt.trim() !== '';

    // Determine if the optimize button should be enabled
    const isOptimizeButtonEnabled = showQuestions && !isLoading;

    return (
        // Main container with a professional gradient background and responsive padding
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 md:p-8 font-sans text-gray-100">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12 w-full max-w-4xl border border-purple-400">
                {/* Hero Section */}
                <div className="text-center mb-10 md:mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4 animate-fade-in-down">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-700">
                            Prompt Engineering
                        </span>
                        <br />
                        with AI Precision
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8 animate-fade-in">
                        Unlock the full potential of AI models. Our intelligent prompt optimizer refines your inputs for unparalleled clarity, specificity, and effectiveness.
                    </p>
                </div>

                {/* Main Input Section */}
                <div className="mb-10">
                    <label htmlFor="userPrompt" className="block text-gray-900 text-xl md:text-2xl font-semibold mb-4">
                        Enter Your Initial Prompt:
                    </label>
                    <textarea
                        id="userPrompt"
                        className="w-full p-5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 text-lg resize-y min-h-[160px] shadow-lg transition-all duration-300 ease-in-out hover:border-purple-400 text-gray-900"
                        placeholder="e.g., 'Generate a creative story about a futuristic city.'"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        rows="6"
                    ></textarea>
                </div>

                {/* Deep Questions Section - Conditionally rendered */}
                {showQuestions && (
                    <div className="mt-10 p-8 bg-purple-50 rounded-2xl border border-purple-200 shadow-xl animate-fade-in-up">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                            </svg>
                            Refine Your Request (5 Key Questions):
                        </h2>

                        {/* Question 1: Goal of the prompt & Expected Output */}
                        <div className="mb-6">
                            <label htmlFor="q1GoalOutput" className="block text-gray-900 text-lg font-medium mb-2">
                                1. What is the goal of the prompt? Are you generating text, code, images, or something else? What kind of output are you expecting?
                                <span className="text-gray-600 text-sm ml-2">(e.g., 'Generate educational text', 'Create persuasive marketing copy', 'Produce a narrative story', 'Develop technical code', 'Generate a realistic image')</span>
                            </label>
                            <textarea id="q1GoalOutput" className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base resize-y min-h-[80px] shadow-sm transition-all duration-200 ease-in-out text-gray-900" value={q1GoalOutput} onChange={(e) => setQ1GoalOutput(e.target.value)} placeholder="e.g., 'Generate a detailed Python script for data analysis; expecting a functional code block.'" rows="3"></textarea>
                        </div>

                        {/* Question 2: Intended Audience */}
                        <div className="mb-6">
                            <label htmlFor="q2Audience" className="block text-gray-900 text-lg font-medium mb-2">
                                2. Who is the intended audience for the output?
                                <span className="text-gray-600 text-sm ml-2">(e.g., 'Students', 'Professionals in finance', 'General public', 'Another AI model', 'Children')</span>
                            </label>
                            <input type="text" id="q2Audience" className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm transition-all duration-200 ease-in-out text-gray-900" value={q2Audience} onChange={(e) => setQ2Audience(e.target.value)} placeholder="e.g., 'Software developers with intermediate experience.'" />
                        </div>

                        {/* Question 3: Model or Tool */}
                        <div className="mb-6">
                            <label htmlFor="q3ModelTool" className="block text-gray-900 text-lg font-medium mb-2">
                                3. What model or tool will this prompt be used with?
                                <span className="text-gray-600 text-sm ml-2">(e.g., 'ChatGPT', 'Gemini', 'Midjourney', 'DALL-E', 'Custom internal AI tool')</span>
                            </label>
                            <input type="text" id="q3ModelTool" className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm transition-all duration-200 ease-in-out text-gray-900" value={q3ModelTool} onChange={(e) => setQ3ModelTool(e.target.value)} placeholder="e.g., 'Gemini 1.5 Pro for text generation.'" />
                        </div>

                        {/* Question 4: Tone or Style Preferences */}
                        <div className="mb-6">
                            <label htmlFor="q4ToneStyle" className="block text-gray-900 text-lg font-medium mb-2">
                                4. Do you have specific tone or style preferences?
                                <span className="text-gray-600 text-sm ml-2">(e.g., 'Formal', 'Casual', 'Authoritative', 'Friendly', 'Humorous', 'Concise', 'Verbose')</span>
                            </label>
                            <input type="text" id="q4ToneStyle" className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm transition-all duration-200 ease-in-out text-gray-900" value={q4ToneStyle} onChange={(e) => setQ4ToneStyle(e.target.value)} placeholder="e.g., 'Professional and slightly informal, like a blog post.'" />
                        </div>

                        {/* Question 5: Constraints or Must-Haves */}
                        <div className="mb-6">
                            <label htmlFor="q5Constraints" className="block text-gray-900 text-lg font-medium mb-2">
                                5. Are there constraints or must-haves in the output?
                                <span className="text-gray-600 text-sm ml-2">(e.g., 'Word count', 'Format (bullet points, paragraphs, code blocks)', 'Sources required', 'Specific keywords', 'Exclusions')</span>
                            </label>
                            <textarea id="q5Constraints" className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base resize-y min-h-[80px] shadow-sm transition-all duration-200 ease-in-out text-gray-900" value={q5Constraints} onChange={(e) => setQ5Constraints(e.target.value)} placeholder="e.g., 'Max 300 words; include 3 key benefits; avoid technical jargon; use markdown code blocks for examples.'" rows="3"></textarea>
                        </div>
                    </div>
                )}

                {/* Optimize button */}
                <div className="flex justify-center mt-8"> {/* Centered button */}
                    <button
                        onClick={optimizePrompt}
                        disabled={!isOptimizeButtonEnabled}
                        className="w-full max-w-md bg-gradient-to-r from-green-600 to-teal-700 text-white py-4 px-6 rounded-xl text-xl font-bold hover:from-green-700 hover:to-teal-800 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Optimizing...</span>
                            </>
                        ) : (
                            <span>Get Optimized Prompt</span>
                        )}
                    </button>
                </div>


                {/* Error display */}
                {error && (
                    <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-base shadow-sm">
                        <p className="font-semibold mb-1">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Optimized prompt display */}
                {optimizedPrompt && (
                    <div className="mt-10 p-8 bg-purple-50 rounded-2xl border border-purple-200 shadow-xl animate-fade-in-up">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 flex items-center justify-between">
                            <span className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                </svg>
                                Optimized Prompt:
                            </span>
                            <div className="relative">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-500 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-75"
                                    title="Copy to clipboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2.5a2.5 2.5 0 012.5 2.5v2.5M17 12H7" />
                                    </svg>
                                </button>
                                {copyFeedback && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap animate-fade-in">
                                        {copyFeedback}
                                    </span>
                                )}
                            </div>
                        </h2>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-inner">
                            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg">
                                {optimizedPrompt}
                            </p>
                        </div>
                    </div>
                )}

                {/* Developed by attribution */}
                <footer className="mt-12 text-center text-gray-600 text-md">
                    Developed by. Oussama SEBROU
                </footer>
            </div>
        </div>
    );
};

export default App;
