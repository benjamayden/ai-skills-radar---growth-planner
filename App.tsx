
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import {
  UserInputData,
  IdentifiedSkillData,
  RubricLevel,
  GrowthPlan,
  AppStep,
  ActiveTabType, // New
  Rater,
  SkillRatingEntry,
  UserRatingsData,
  AppExportData,
  RUBRIC_LEVEL_MAP,
} from './types';
import { APP_TITLE, MAX_FOCUS_SKILLS } from './constants';
import { geminiService } from './services/geminiService';

import ApiKeyInput from './components/ApiKeyInput';
import UserInputForm from './components/UserInputForm';
import LoadingIndicator from './components/LoadingIndicator';
import SkillsRadarChart from './components/SkillsRadarChart';
import SkillRubricCard from './components/SkillRubricCard';
import FocusSkillsSelector from './components/FocusSkillsSelector';
import GrowthPlanDisplay from './components/GrowthPlanDisplay';
import SuggestedJobs from './components/SuggestedJobs';
import RaterManager from './components/RaterManager';
import ThemeToggle from './components/ThemeToggle';

const APP_VERSION = "1.8.0"; // Updated for API Key and Print Refinements

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [genAI, setGenAI] = useState<GoogleGenAI | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.PROCESSING); // Start in processing to check key
  const [activeTab, setActiveTab] = useState<ActiveTabType>('details');
  
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading for API key check
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing API...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [userInput, setUserInput] = useState<UserInputData | null>(null);
  
  const [identifiedSkills, setIdentifiedSkills] = useState<IdentifiedSkillData[]>([]);
  
  const initialSelfRater: Rater = { id: 'self', name: 'Self-Assessed', isSelf: true };
  const [raters, setRaters] = useState<Rater[]>([initialSelfRater]);
  const [activeRaterId, setActiveRaterId] = useState<string>(initialSelfRater.id);
  const [userRatings, setUserRatings] = useState<UserRatingsData>({});

  const [focusSkills, setFocusSkills] = useState<string[]>([]);
  const [growthPlans, setGrowthPlans] = useState<GrowthPlan[]>([]);
  const [suggestedJobTitles, setSuggestedJobTitles] = useState<string[]>([]);

  const previousRatingsRef = useRef<UserRatingsData>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rubricCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const tryInitGenAI = useCallback(async (key: string | null, source: 'env' | 'localStorage' | 'input'): Promise<boolean> => {
    if (!key) {
      if (source !== 'env' && source !== 'localStorage') { // Only show error for input if key is truly missing
          setApiKeyError(`API Key from ${source} is missing.`);
      }
      return false;
    }
    setIsLoading(true);
    setLoadingMessage(`Verifying API Key from ${source}...`);
    setApiKeyError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      await ai.models.generateContent({model: 'gemini-2.5-flash-preview-04-17', contents: [{role: "user", parts: [{text: "hello"}]}]});
      setGenAI(ai);
      if (source === 'input') { // Only save to localStorage if it's from user input
        localStorage.setItem('geminiApiKey', key);
      }
      setCurrentStep(userInput ? AppStep.MAIN_VIEW : AppStep.USER_DATA_INPUT);
      if (userInput && activeTab) setActiveTab(activeTab); else setActiveTab('details');
      return true;
    } catch (error) {
      console.error(`API Key Initialization Error (source: ${source}):`, error);
      setApiKeyError(`Failed to initialize API Key from ${source}. Please check the key and network connection.`);
      setGenAI(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userInput, activeTab]); // Added activeTab to dependencies

  useEffect(() => {
    const initialize = async () => {
        let keyInitialized = false;
        // 1. Try process.env.API_KEY
        if (process.env.API_KEY) {
            keyInitialized = await tryInitGenAI(process.env.API_KEY, 'env');
        }
        // 2. If not, try localStorage
        if (!keyInitialized) {
            const storedKey = localStorage.getItem('geminiApiKey');
            if (storedKey) {
                keyInitialized = await tryInitGenAI(storedKey, 'localStorage');
            }
        }
        // 3. If still not initialized, go to input step
        if (!keyInitialized) {
            setCurrentStep(AppStep.API_KEY_INPUT);
            setIsLoading(false); // Ensure loading stops if no key is found
        }
    };
    initialize();
  }, [tryInitGenAI]); // tryInitGenAI is stable due to useCallback

  
  const resetAllApplicationData = (keepApiKeySetup = true) => {
    setErrorMessage(null);
    setUserInput(null);
    setIdentifiedSkills([]);
    setUserRatings({});
    setFocusSkills([]);
    setGrowthPlans([]);
    setSuggestedJobTitles([]);
    setRaters([initialSelfRater]);
    setActiveRaterId(initialSelfRater.id);
    setActiveTab('details');
    rubricCardRefs.current = {};

    if (keepApiKeySetup && genAI) {
      setCurrentStep(AppStep.USER_DATA_INPUT);
    } else {
      // If genAI is null or we are not keeping API key setup, go to API_KEY_INPUT
      // This might happen if the stored key becomes invalid later or user wants full reset
      setCurrentStep(AppStep.API_KEY_INPUT);
      setGenAI(null); // Clear genAI instance
      localStorage.removeItem('geminiApiKey'); // Clear stored key on full reset
    }
    setIsLoading(false);
  };

  const handleApiKeySubmit = useCallback(async (apiKeyInput: string) => {
    await tryInitGenAI(apiKeyInput, 'input');
  }, [tryInitGenAI]);

  const handleUserInputSubmit = useCallback(async (data: UserInputData) => {
    if (!genAI) {
      setErrorMessage("Gemini AI client not initialized. Please ensure the API Key is configured and valid.");
      setCurrentStep(AppStep.API_KEY_INPUT);
      return;
    }
    
    previousRatingsRef.current = JSON.parse(JSON.stringify(userRatings));
    setUserInput(data);
    setCurrentStep(AppStep.PROCESSING);
    setIsLoading(true);
    setLoadingMessage("Identifying skills and generating rubrics...");
    setErrorMessage(null);

    setFocusSkills([]);
    setGrowthPlans([]);
    setSuggestedJobTitles([]);
    rubricCardRefs.current = {};

    try {
      const { skills: newSkills } = await geminiService.identifySkillsAndGenerateRubrics(genAI, data);
      
      const updatedRatings: UserRatingsData = {};
      if (newSkills && Array.isArray(newSkills)) {
        newSkills.forEach(newSkill => {
          if (previousRatingsRef.current[newSkill.id]) {
            updatedRatings[newSkill.id] = previousRatingsRef.current[newSkill.id];
          }
        });
      }
      
      setIdentifiedSkills(newSkills || []);
      setUserRatings(updatedRatings);

      if (newSkills && newSkills.length > 0) {
        setCurrentStep(AppStep.MAIN_VIEW);
        setActiveTab('radar'); 
      } else {
        setErrorMessage("No skills were identified. Please try refining your input.");
        setCurrentStep(userInput ? AppStep.MAIN_VIEW : AppStep.USER_DATA_INPUT);
        setActiveTab('details');
      }
    } catch (error) {
      console.error("Error identifying skills:", error);
      setErrorMessage(`Error identifying skills: ${(error as Error).message}. You might want to try modifying your input or check the console.`);
      setCurrentStep(userInput ? AppStep.MAIN_VIEW : AppStep.USER_DATA_INPUT);
      setActiveTab('details');
    } finally {
      setIsLoading(false);
    }
  }, [genAI, userRatings, userInput]);

  const handleRateSkill = useCallback((skillId: string, rating: RubricLevel) => {
    setUserRatings(prev => {
      const newRatings = { ...prev };
      const skillRatings = newRatings[skillId] ? [...newRatings[skillId]] : [];
      const raterIndex = skillRatings.findIndex(r => r.raterId === activeRaterId);

      if (raterIndex > -1) {
        skillRatings[raterIndex] = { ...skillRatings[raterIndex], rating };
      } else {
        skillRatings.push({ raterId: activeRaterId, rating });
      }
      newRatings[skillId] = skillRatings;
      return newRatings;
    });
  }, [activeRaterId]);
  
  const currentRatingsForChart = (): Record<string, number> => {
    const activeRatings: Record<string, number> = {};
    identifiedSkills.forEach(skill => {
      const ratingEntry = userRatings[skill.id]?.find(r => r.raterId === activeRaterId);
      activeRatings[skill.id] = ratingEntry ? RUBRIC_LEVEL_MAP[ratingEntry.rating] : 0;
    });
    return activeRatings;
  };
  
  const getRatingForSkillCard = (skillId: string): RubricLevel | undefined => {
      return userRatings[skillId]?.find(r => r.raterId === activeRaterId)?.rating;
  };
  
  const getAllRatingsSummaryForSkill = (skillId: string): string => {
    if (!userRatings[skillId] || userRatings[skillId].length === 0) return "No ratings yet.";
    return userRatings[skillId].map(sr => {
        const raterName = raters.find(r => r.id === sr.raterId)?.name || sr.raterId;
        return `${raterName}: ${sr.rating}`;
    }).join('; ');
  };

  const handleSkillToggleFocus = useCallback((skillId: string) => {
    setFocusSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      }
      if (prev.length < MAX_FOCUS_SKILLS) {
        return [...prev, skillId];
      }
      return prev;
    });
  }, []);

  const handleGenerateGrowthPlansAndJobs = useCallback(async () => {
    if (!genAI || focusSkills.length === 0 || !userInput) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    setLoadingMessage("Crafting growth plans...");
    const plans: GrowthPlan[] = [];
    try {
      for (const skillId of focusSkills) {
        const skill = identifiedSkills.find(s => s.id === skillId);
        const ratingEntry = userRatings[skillId]?.find(r => r.raterId === 'self') || userRatings[skillId]?.[0];
        if (skill && ratingEntry) { 
          const plan = await geminiService.generateGrowthPlan(genAI, skill.name, ratingEntry.rating, userInput.aspirationsGoals);
          plans.push(plan);
        }
      }
      setGrowthPlans(plans);
    } catch (error) {
      console.error("Error generating growth plans:", error);
      setErrorMessage(`Error generating growth plans: ${(error as Error).message}`);
      setIsLoading(false); 
      return; 
    }

    setLoadingMessage("Suggesting job titles...");
    try {
      const skillsForJobSuggestion = identifiedSkills
        .map(skill => {
          const selfRating = userRatings[skill.id]?.find(r => r.raterId === 'self')?.rating;
          if (selfRating) return { skillName: skill.name, rating: selfRating };
          const firstAvailableRating = userRatings[skill.id]?.[0]?.rating;
          if (firstAvailableRating) return { skillName: skill.name, rating: firstAvailableRating};
          return null;
        })
        .filter(sr => sr !== null) as { skillName: string; rating: RubricLevel }[];
            
      if (skillsForJobSuggestion.length > 0) {
        const titles = await geminiService.suggestJobTitles(genAI, skillsForJobSuggestion);
        setSuggestedJobTitles(titles);
      } else {
        setSuggestedJobTitles([]);
      }
    } catch (error) {
      console.error("Error suggesting job titles:", error);
      setErrorMessage(`Error suggesting job titles: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [genAI, focusSkills, identifiedSkills, userRatings, userInput]);

  const handleAddRater = (name: string) => {
    if (name.trim() && !raters.find(r => r.name.toLowerCase() === name.trim().toLowerCase())) {
      const newRater: Rater = { id: `rater_${Date.now()}`, name: name.trim(), isSelf: false };
      setRaters(prev => [...prev, newRater]);
      setActiveRaterId(newRater.id);
       setErrorMessage(null); // Clear previous error if any
    } else if (!name.trim()) {
      setErrorMessage("Rater name cannot be empty.");
    }
     else {
      setErrorMessage("Rater name already exists. Please use a unique name.");
    }
  };
  
  const handleExportData = () => {
    const exportData: AppExportData = {
      appVersion: APP_VERSION,
      userInput,
      identifiedSkills,
      raters,
      userRatings,
      focusSkills,
      growthPlans,
      suggestedJobTitles,
      activeTab: currentStep === AppStep.MAIN_VIEW ? activeTab : undefined,
      activeRaterId: currentStep === AppStep.MAIN_VIEW ? activeRaterId : undefined,
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai_skills_radar_data_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const importedData = JSON.parse(jsonString) as AppExportData;

        if (!importedData || typeof importedData !== 'object') throw new Error("Invalid file format.");
        if (!Array.isArray(importedData.identifiedSkills)) throw new Error("Missing or invalid 'identifiedSkills'.");
        
        // Validate raters structure minimally
        if (!Array.isArray(importedData.raters) || 
            importedData.raters.length === 0 || 
            !importedData.raters.every(r => typeof r.id === 'string' && typeof r.name === 'string' && typeof r.isSelf === 'boolean')) {
             importedData.raters = [initialSelfRater]; // Fallback to initial self-rater
        }


        setUserInput(importedData.userInput || null);
        setIdentifiedSkills(importedData.identifiedSkills || []);
        setRaters(importedData.raters); 
        setUserRatings(importedData.userRatings || {});
        setFocusSkills(importedData.focusSkills || []);
        setGrowthPlans(importedData.growthPlans || []);
        setSuggestedJobTitles(importedData.suggestedJobTitles || []);
        rubricCardRefs.current = {};
        
        // Determine activeRaterId after raters have been set
        let raterIdToRestore = initialSelfRater.id; // Absolute fallback
        const currentImportedRaters = importedData.raters || []; 
        if (currentImportedRaters.length > 0) {
            // Fallback to the self-assessed rater among imported ones, or the first imported rater
            raterIdToRestore = currentImportedRaters.find(r => r.isSelf)?.id || currentImportedRaters[0].id;
            // If a valid activeRaterId was part of the import, prioritize it
            if (importedData.activeRaterId && currentImportedRaters.find(r => r.id === importedData.activeRaterId)) {
                raterIdToRestore = importedData.activeRaterId;
            }
        }
        setActiveRaterId(raterIdToRestore);

        setErrorMessage(null);
        
        if (!genAI) {
            setCurrentStep(AppStep.API_KEY_INPUT);
            setErrorMessage("Data imported. Please verify/enter your API key to enable AI features.");
        } else if (importedData.userInput && importedData.identifiedSkills.length > 0) {
            setCurrentStep(AppStep.MAIN_VIEW);
            setActiveTab(importedData.activeTab || 'radar');
        } else if (importedData.userInput) { 
            setCurrentStep(AppStep.MAIN_VIEW);
            setActiveTab('details');
        } else { 
            setCurrentStep(AppStep.USER_DATA_INPUT);
        }
      } catch (err) {
        console.error("Error importing data:", err);
        setErrorMessage(`Failed to import data: ${(err as Error).message}. Ensure the file is valid.`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const triggerImport = () => fileInputRef.current?.click();
  const handlePrintForFeedback = () => window.print();

  const handleRadarSkillClick = useCallback((skillId: string) => {
    const skillCardElement = rubricCardRefs.current[skillId];
    if (skillCardElement) {
      skillCardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center', 
      });
    }
  }, []);


  const TabButton: React.FC<{ tabId: ActiveTabType; currentTab: ActiveTabType; onClick: () => void; children: React.ReactNode }> = 
    ({ tabId, currentTab, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 print-hide
        ${currentTab === tabId 
          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
          : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
      aria-current={currentTab === tabId ? 'page' : undefined}
    >
      {children}
    </button>
  );
  
  const renderMainViewContent = () => {
    const activeRaterForDisplay = raters.find(r => r.id === activeRaterId) || initialSelfRater;
    switch (activeTab) {
      case 'details':
        return (
          <UserInputForm 
            onSubmit={handleUserInputSubmit} 
            loading={isLoading && currentStep === AppStep.PROCESSING}
            initialData={userInput} 
          />
        );
      case 'radar':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 space-y-6 radar-column-print"> {/* Left Column */}
              <RaterManager 
                raters={raters} 
                activeRaterId={activeRaterId} 
                onAddRater={handleAddRater} 
                onSelectRater={setActiveRaterId}
                className="print-hide" 
              />
              <SkillsRadarChart 
                skills={identifiedSkills} 
                ratingsData={currentRatingsForChart()} 
                raterName={activeRaterForDisplay.name}
                theme={theme}
                onSkillLabelClick={handleRadarSkillClick}
              />
               <div className="print-skills-list hidden print:block space-y-1 mt-4">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills Overview ({activeRaterForDisplay.name}):</h4>
                {identifiedSkills.map(skill => {
                    const rating = getRatingForSkillCard(skill.id);
                    return (
                        <div key={skill.id} className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>{skill.name}:</strong> {rating || "Not Rated"}
                        </div>
                    );
                })}
               </div>
              <button
                onClick={handlePrintForFeedback}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md print-hide"
              >
                Print Radar for feedback
              </button>
            </div>
            <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 rubrics-column-print"> {/* Right Column - Scrollable */}
              <div className="hidden print:block print-only-header mb-4 p-2 border-b border-gray-300">
                  <p className="text-sm"><strong>Name:</strong> {activeRaterForDisplay.name}</p>
                  {/* User goals/context removed from here for print */}
              </div>
              {identifiedSkills.length > 0 ? identifiedSkills.map(skill => (
                <div 
                  key={skill.id} 
                  className="skill-rubric-card-print-wrapper" 
                  ref={(el) => { rubricCardRefs.current[skill.id] = el; }}
                >
                  <SkillRubricCard
                    skillData={skill}
                    currentRatingForActiveRater={getRatingForSkillCard(skill.id)}
                    onRateSkill={handleRateSkill}
                    allRatingsSummary={getAllRatingsSummaryForSkill(skill.id)}
                  />
                </div>
              )) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No skills identified yet. Go to "My Details" to generate skills.</p>}
            </div>
          </div>
        );
      case 'growth':
        return (
          <div className="space-y-6">
            <FocusSkillsSelector
              skills={identifiedSkills}
              selectedSkills={focusSkills}
              onSkillToggle={handleSkillToggleFocus}
            />
            <button
              onClick={handleGenerateGrowthPlansAndJobs}
              disabled={focusSkills.length === 0 || isLoading || !genAI}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out print-hide"
            >
              {isLoading && (loadingMessage.includes("growth plans") || loadingMessage.includes("job titles")) ? 'Generating...' : 'Generate Growth Plans & Job Suggestions'}
            </button>
            {isLoading && (currentStep === AppStep.PROCESSING && (loadingMessage.includes("growth plans") || loadingMessage.includes("job titles"))) && <LoadingIndicator message={loadingMessage} />}
            
            {growthPlans.length > 0 && (
              <div className="results-section-growth-plans">
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 mt-8">Personalized Growth Plans</h3>
                 {growthPlans.map((plan, index) => (
                     <div key={index} className="growth-plan-display-item-print">
                        <GrowthPlanDisplay growthPlans={[plan]} />
                     </div>
                ))}
              </div>
            )}
            {suggestedJobTitles.length > 0 && (
              <div className="results-section-jobs suggested-jobs-print">
                <SuggestedJobs jobTitles={suggestedJobTitles} />
              </div>
            )}
             {focusSkills.length > 0 && growthPlans.length === 0 && suggestedJobTitles.length === 0 && !isLoading &&
                <p className="text-center text-gray-500 dark:text-gray-400 py-6">Select focus skills and click "Generate" to see your growth plan and job suggestions. {!genAI && 'API Key needed.'}</p>
             }
             {identifiedSkills.length === 0 && 
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">Please generate skills from the "My Details" tab first.</p>
             }

          </div>
        );
      default: return null;
    }
  };

  const renderContent = () => {
    if (currentStep === AppStep.API_KEY_INPUT) {
      return (
        <>
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} loading={isLoading} />
          {apiKeyError && <p className="mt-4 text-center text-red-600 dark:text-red-400">{apiKeyError}</p>}
        </>
      );
    }
    
    if (isLoading && currentStep === AppStep.PROCESSING && !(loadingMessage.includes("growth plans") || loadingMessage.includes("job titles"))) { 
        return <LoadingIndicator message={loadingMessage} />;
    }
     if (isLoading && currentStep !== AppStep.PROCESSING && currentStep !== AppStep.API_KEY_INPUT && !(loadingMessage.includes("growth plans") || loadingMessage.includes("job titles"))) {
        return <LoadingIndicator message={loadingMessage || "Initializing..."} />; // General loading for initial key check
    }

    
    if (currentStep === AppStep.USER_DATA_INPUT) {
      return <UserInputForm onSubmit={handleUserInputSubmit} loading={isLoading} initialData={userInput} />;
    }

    if (currentStep === AppStep.MAIN_VIEW) {
      return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-0 md:p-2">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6 print-hide"> 
            <nav className="-mb-px flex space-x-0 md:space-x-4" aria-label="Tabs">
              <TabButton tabId="details" currentTab={activeTab} onClick={() => setActiveTab('details')}>My Details</TabButton>
              <TabButton tabId="radar" currentTab={activeTab} onClick={() => setActiveTab('radar')}>Skills Radar & Rubrics</TabButton>
              <TabButton tabId="growth" currentTab={activeTab} onClick={() => setActiveTab('growth')}>Growth Plan</TabButton>
            </nav>
          </div>
          <div className="px-0 py-0 md:px-6 md:py-4">
            {renderMainViewContent()}
          </div>
        </div>
      );
    }
    return <LoadingIndicator message={isLoading ? loadingMessage : "Loading application..."} />;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <header className="mb-6 relative print-hide">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary-700 dark:text-primary-500 tracking-tight">
            {APP_TITLE}
            </h1>
            <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover your strengths, identify growth areas, and align your career with market demands.
            </p>
        </div>
         <div className="absolute top-0 right-0 p-1 flex space-x-1">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <div className={`${currentStep === AppStep.MAIN_VIEW ? 'max-w-7xl' : 'max-w-xl'} mx-auto`}>
        <div className="mb-6 flex flex-wrap justify-center gap-2 md:gap-4 print-hide">
            <button
                onClick={() => resetAllApplicationData(genAI !== null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                Start Over
            </button>
            <button
                onClick={handleExportData}
                className="px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={!userInput && (!identifiedSkills || identifiedSkills.length === 0)}
            >
                Export Data (JSON)
            </button>
            <button
                onClick={triggerImport}
                className="px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Import Data (JSON)
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" aria-hidden="true"/>
        </div>
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border-red-400 text-red-700 rounded-md shadow-md dark:bg-red-900 dark:border-red-700 dark:text-red-300 print-hide" role="alert">
            <strong className="font-bold">Error: </strong> {errorMessage}
          </div>
        )}
        {renderContent()}
      </div>

      <footer className="text-center mt-12 py-6 border-t border-gray-300 dark:border-gray-700 print-hide">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Powered by Google Gemini.
        </p>
         <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          App Version: {APP_VERSION}
        </p>
      </footer>
    </div>
  );
};

export default App;