
import React, { useState } from 'react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  loading: boolean;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit, loading }) => {
  const [key, setKey] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onApiKeySubmit(key.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">Enter Your Gemini API Key</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This application requires your own Google Gemini API key to function. 
        If `process.env.API_KEY` is not set in the deployment environment, the key you enter here will be used.
      </p>
      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-600 p-3 my-4 rounded">
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          <strong>Security Note:</strong> If you provide a key through this form, it will be stored in your browser's `localStorage` for convenience. 
          While this makes it easier to reuse the app without re-entering your key, be aware that storing API keys in `localStorage` is generally not recommended for production applications or if you share your browser/computer. 
          The most secure way to use this app is by having the API key set as an environment variable (`process.env.API_KEY`) during deployment.
        </p>
      </div>
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
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {loading ? 'Verifying...' : 'Submit Key & Save Locally'}
        </button>
      </form>
    </div>
  );
};

export default ApiKeyInput;
