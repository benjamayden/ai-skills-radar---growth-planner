
import React, { useState } from 'react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  loading: boolean;
  error?: string | null;
  onTriggerImport?: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit, loading, error, onTriggerImport }) => {
  const [key, setKey] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onApiKeySubmit(key.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">Enter Your Gemini API Key</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This application requires your own Google Gemini API key to function. 
        If `GEMINI_API_KEY` is not set in the environment, you can enter your key here.
      </p>
      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-600 p-3 my-4 rounded">
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          <strong>Security Note:</strong> If you provide a key through this form, it will be stored in your browser's `localStorage` for convenience. 
          While this makes it easier to reuse the app without re-entering your key, be aware that storing API keys in `localStorage` is generally not recommended for production applications or if you share your browser/computer. 
          The most secure way to use this app is by having the API key set as an environment variable (`GEMINI_API_KEY`) during deployment.
        </p>
      </div>
      
      {error && (error.includes('Rate Limit') || error.includes('quota')) && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-600 p-3 my-4 rounded">
          <h4 className="font-medium text-sm text-blue-800 dark:text-blue-300">About Rate Limits</h4>
          <ul className="list-disc pl-5 mt-1 text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>Google's free tier allows 500 Gemini API requests per day</li>
            <li>Quotas reset at midnight Pacific Time (PT)</li>
            <li>Each action in this app may use multiple API calls</li>
            <li>You can create multiple API keys with the same Google account</li>
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key (if not set in environment)
          </label>
          <input
            type="password"
            id="apiKey"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
            placeholder="Enter your API key"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out mb-4"
        >
          {loading ? 'Verifying...' : 'Submit Key & Save Locally'}
        </button>
      </form>
      
      {onTriggerImport && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Or Use Existing Data</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Don't have an API key? You can still use the app with previously exported data.
          </p>
          <button
            onClick={onTriggerImport}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out border border-gray-300 dark:border-gray-600"
          >
            Import Data From File
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">API Key Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                {error}
              </div>
              {error && (error.includes('Rate Limit') || error.includes('quota')) && (
                <div className="mt-2 space-y-2">
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/rate-limits" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                    >
                      Learn more about API rate limits
                    </a>
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                    >
                      Create a new API key
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput;
