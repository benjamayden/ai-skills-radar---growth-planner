import React, { useState, useEffect } from 'react';
import { UserInputData } from '../types';

interface UserInputFormProps {
  onSubmit: (data: UserInputData) => void;
  loading: boolean;
  initialData?: UserInputData | null;
}

const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<UserInputData>({
    hardSkills: '',
    resumeInfo: '',
    aspirationsThrive: '',
    aspirationsGoals: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
       setFormData({
        hardSkills: '',
        resumeInfo: '',
        aspirationsThrive: '',
        aspirationsGoals: '',
      });
    }
  }, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Added text-gray-900 and placeholder-gray-500 for light mode. Added dark:disabled:text-gray-400
  const formFieldClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:disabled:text-gray-400";
  const formLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const helperTextClass = "mt-1 text-xs text-gray-500 dark:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <div>
        <label htmlFor="hardSkills" className={formLabelClass}>
          Hard Skills <span className="text-red-500">*</span>
        </label>
        <textarea
          id="hardSkills"
          name="hardSkills"
          rows={3}
          value={formData.hardSkills}
          onChange={handleChange}
          className={formFieldClass}
          placeholder="e.g., Python, React, SQL, UX Research, Agile Project Management"
          required
          disabled={loading}
        />
        <p className={helperTextClass}>List your key technical and domain-specific skills.</p>
      </div>

      <div>
        <label htmlFor="resumeInfo" className={formLabelClass}>
          Resume Information / Key Experience <span className="text-red-500">*</span>
        </label>
        <textarea
          id="resumeInfo"
          name="resumeInfo"
          rows={5}
          value={formData.resumeInfo}
          onChange={handleChange}
          className={formFieldClass}
          placeholder="Paste relevant sections of your resume or describe key projects and responsibilities. Focus on extracting skills and context."
          required
          disabled={loading}
        />
        <p className={helperTextClass}>Help the AI understand your experience context. This is crucial for personalized rubrics.</p>
      </div>

      <div>
        <label htmlFor="aspirationsThrive" className={formLabelClass}>
          What Makes You Thrive? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="aspirationsThrive"
          name="aspirationsThrive"
          rows={3}
          value={formData.aspirationsThrive}
          onChange={handleChange}
          className={formFieldClass}
          placeholder="e.g., Solving complex problems, collaborating with teams, learning new technologies, mentoring others"
          required
          disabled={loading}
        />
        <p className={helperTextClass}>Describe activities or environments where you feel most engaged and energized. This helps tailor skill suggestions.</p>
      </div>

      <div>
        <label htmlFor="aspirationsGoals" className={formLabelClass}>
          Career Goals (Next 5 Years) <span className="text-red-500">*</span>
        </label>
        <textarea
          id="aspirationsGoals"
          name="aspirationsGoals"
          rows={3}
          value={formData.aspirationsGoals}
          onChange={handleChange}
          className={formFieldClass}
          placeholder="e.g., Become a Senior Product Manager, lead a design team, specialize in AI product development"
          required
          disabled={loading}
        />
         <p className={helperTextClass}>Where do you see your career heading? This influences skill relevance.</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        aria-live="polite"
      >
        {loading ? 'Analyzing Your Information...' : 'Generate My Skills Radar'}
      </button>
    </form>
  );
};

export default UserInputForm;