import React from 'react';

interface SuggestedJobsProps {
  jobTitles: string[];
}

const SuggestedJobs: React.FC<SuggestedJobsProps> = ({ jobTitles }) => {
  if (!jobTitles || jobTitles.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No job titles suggested based on current profile.</p>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Potential Job Titles</h3>
      <ul className="space-y-2">
        {jobTitles.map((title, index) => (
          <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedJobs;
