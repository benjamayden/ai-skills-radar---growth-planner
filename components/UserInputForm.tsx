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
    teamStrategy: '',
    companyStrategy: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
    } else {
      setFormData({
        hardSkills: '',
        resumeInfo: '',
        aspirationsThrive: '',
        aspirationsGoals: '',
        teamStrategy: '',
        companyStrategy: '',
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

  const formFieldClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:disabled:text-gray-400";
  const formLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const helperTextClass = "mt-1 text-xs text-gray-500 dark:text-gray-400";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-12 lg:gap-4">
        {/* Left Sidebar - Guidance */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 lg:rounded-lg lg:shadow-xl lg:top-8 lg:h-fit">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎯 Your AI-Powered Career Compass
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                5 minutes to unlock your personalized growth roadmap
              </p>
            </div>

            {/* How It Works */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                How It Works
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🧠</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">AI Analysis</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">We analyze your background against current market trends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎯</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Smart Curation</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Generate 15-20 strategic skill recommendations ranked by impact</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📊</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Your 12-Skill Radar</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">You choose 6 focus skills + 6 universal growth enablers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🚀</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Growth Plans</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Get actionable development strategies with resources</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* What Each Field Does */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 What Each Field Does
              </h2>
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    🛠️ Hard Skills
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">Builds on your technical foundation</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    📄 Experience
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">Matches your career level & trajectory</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    🌟 What Energizes You
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">Ensures sustainable, motivating growth</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    🚀 5-Year Goals
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">Reverse-engineers skills for your vision</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    👥 Team Strategy
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">Makes you valuable to your current team</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    🏢 Company Direction
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">Aligns with organizational opportunities</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* The More Detail, The Better */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ✨ The More Detail, The Better
              </h2>
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
                Rich responses = Precise recommendations
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                The AI uses every detail to create laser-focused suggestions that actually advance your specific goals.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                Your data stays private and secure
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="lg:col-span-6 mt-8 lg:mt-0">
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

            <div>
              <label htmlFor="teamStrategy" className={formLabelClass}>
                Team Strategy
              </label>
              <textarea
                id="teamStrategy"
                name="teamStrategy"
                rows={2}
                value={formData.teamStrategy || ''}
                onChange={handleChange}
                className={formFieldClass}
                placeholder="Describe your team's current strategy, priorities, or focus areas. (Optional)"
                disabled={loading}
              />
              <p className={helperTextClass}>Share your team's main objectives or strategic direction if relevant.</p>
            </div>

            <div>
              <label htmlFor="companyStrategy" className={formLabelClass}>
                Company Strategy
              </label>
              <textarea
                id="companyStrategy"
                name="companyStrategy"
                rows={2}
                value={formData.companyStrategy || ''}
                onChange={handleChange}
                className={formFieldClass}
                placeholder="Describe your company's current strategy, mission, or vision. (Optional)"
                disabled={loading}
              />
              <p className={helperTextClass}>Share your company's strategic direction, mission, or vision if relevant.</p>
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
        </div>
      </div>
    </div>
  );
};

export default UserInputForm;