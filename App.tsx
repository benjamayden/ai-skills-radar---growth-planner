import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import {
  UserInputData,
  IdentifiedSkillData,
  RubricLevel,
  GrowthPlan,
  AppStep,
  ActiveTabType,
  Rater,
  UserRatingsData,
  AppExportData,
  AppExportDataV2,
  RUBRIC_LEVEL_MAP,
  MAX_RUBRIC_LEVEL_VALUE,
  SELF_ASSESSMENT_RATER_ID,
  SuggestedJobsResponse,
  RadarDisplaySeries,
  SkillSelectionState,
  SkillGenerationResponse,
  SkillBank,
  SkillStatus,
  SkillMasteryCheck,
} from "./types";
import {
  APP_TITLE,
  MAX_FOCUS_SKILLS,
  SELF_ASSESSMENT_COLOR,
  RADAR_SERIES_COLORS,
  RADAR_AVERAGE_COLOR,
  CYCLING_LOADING_MESSAGES,
} from "./constants";
import { geminiService } from "./services/geminiService";

import ApiKeyInput from "./components/ApiKeyInput";
import LoadingIndicator from "./components/LoadingIndicator";
import HeaderNavigation from "./components/HeaderNavigation";
import ThemeToggle from "./components/ThemeToggle";
import RateLimitInfo from "./components/RateLimitInfo";
import SkillSelectionInterface from "./components/SkillSelectionInterface";
import TabDetails from "./pages/TabDetails";
import TabRadar from "./pages/TabRadar";
import TabGrowth from "./pages/TabGrowth";
import TabRadarAndRubrics from "./pages/TabRadarAndRubrics";

const APP_VERSION = "1.13.0"; // Version for Growth Dimension Analysis Feature

type Theme = "light" | "dark";

type LoadingMessageItem = { text: string; duration: number };

const App: React.FC = () => {
  const [genAI, setGenAI] = useState<GoogleGenAI | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.PROCESSING);
  const [activeTab, setActiveTab] = useState<ActiveTabType>("details");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    "Initializing API..."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [userInput, setUserInput] = useState<UserInputData | null>(null);

  // Skill Selection State
  const [skillSelection, setSkillSelection] = useState<SkillSelectionState | null>(null);

  // Skill Banking State - replaces simple identifiedSkills
  const [skillBank, setSkillBank] = useState<SkillBank>({
    activeSkills: [],
    masteredSkills: [],
    allSkillsData: []
  });
  const [skillStatuses, setSkillStatuses] = useState<Record<string, SkillStatus>>({});

  // Legacy support - computed from skillBank
  const identifiedSkills = skillBank.allSkillsData.filter(skill => 
    skillBank.activeSkills.includes(skill.id)
  );
  const setIdentifiedSkills = (skills: IdentifiedSkillData[]) => {
    setSkillBank(prev => ({
      ...prev,
      activeSkills: skills.map(s => s.id),
      allSkillsData: skills
    }));
    // Initialize all skills as active
    const newStatuses: Record<string, SkillStatus> = {};
    skills.forEach(skill => {
      newStatuses[skill.id] = SkillStatus.ACTIVE;
    });
    setSkillStatuses(newStatuses);
  };
  // const [skillIdentificationAttributions, setSkillIdentificationAttributions] =
  //   useState<GroundingChunk[]>([]);

  const initialSelfRater: Rater = {
    id: SELF_ASSESSMENT_RATER_ID,
    name: "Self-Assessed",
    isSelf: true,
  };
  const [raters, setRaters] = useState<Rater[]>([initialSelfRater]);
  const [activeRaterId, setActiveRaterId] = useState<string>(
    initialSelfRater.id
  );
  const [userRatings, setUserRatings] = useState<UserRatingsData>({});

  const [comparisonRaterIds, setComparisonRaterIds] = useState<string[]>([
    initialSelfRater.id,
  ]);
  const [showAverageOnRadar, setShowAverageOnRadar] = useState<boolean>(false);

  const [focusSkills, setFocusSkills] = useState<string[]>([]);
  const [growthPlans, setGrowthPlans] = useState<GrowthPlan[]>([]);
  const [suggestedJobTitles, setSuggestedJobTitles] = useState<string[]>([]);
  // const [jobSuggestionAttributions, setJobSuggestionAttributions] = useState<
  //   GroundingChunk[]
  // >([]);

  const previousRatingsRef = useRef<UserRatingsData>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rubricCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Dynamic Loading Message State
  const [staticLoadingPrefix, setStaticLoadingPrefix] = useState<string>("");
  const [loadingMessageQueue, setLoadingMessageQueue] = useState<
    LoadingMessageItem[]
  >([]);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] =
    useState<number>(0);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Effect for cycling loading messages
  useEffect(() => {
    if (isLoading && loadingMessageQueue.length > 0) {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);

      const currentMessageItem =
        loadingMessageQueue[currentLoadingMessageIndex];
      setLoadingMessage(staticLoadingPrefix + currentMessageItem.text);

      loadingIntervalRef.current = setInterval(() => {
        setCurrentLoadingMessageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % loadingMessageQueue.length;
          setLoadingMessage(
            staticLoadingPrefix + loadingMessageQueue[nextIndex].text
          );
          // Clear previous interval and set new one with potentially different duration
          if (loadingIntervalRef.current)
            clearInterval(loadingIntervalRef.current);
          loadingIntervalRef.current = setInterval(() => {
            // This nested interval is to advance, the outer part is just to set the message immediately
            // This logic needs simplification. Let's re-evaluate.
          }, loadingMessageQueue[nextIndex].duration); // This is getting complex.

          return nextIndex;
        });
      }, currentMessageItem.duration); // This interval is for the current message's duration
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [
    isLoading,
    loadingMessageQueue,
    currentLoadingMessageIndex,
    staticLoadingPrefix,
  ]);

  // Simpler useEffect for loading messages
  useEffect(() => {
    if (isLoading && loadingMessageQueue.length > 0) {
      const currentMsg = loadingMessageQueue[currentLoadingMessageIndex];
      setLoadingMessage(staticLoadingPrefix + currentMsg.text);

      const timeoutId = setTimeout(() => {
        setCurrentLoadingMessageIndex(
          (prevIndex) => (prevIndex + 1) % loadingMessageQueue.length
        );
      }, currentMsg.duration);

      return () => clearTimeout(timeoutId);
    }
  }, [
    isLoading,
    loadingMessageQueue,
    currentLoadingMessageIndex,
    staticLoadingPrefix,
  ]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const tryInitGenAI = useCallback(
    async (
      key: string | null,
      source: "env" | "localStorage" | "input"
    ): Promise<boolean> => {
      if (!key) {
        if (source !== "env" && source !== "localStorage") {
          setApiKeyError(`API Key from ${source} is missing.`);
        }
        return false;
      }
      setIsLoading(true);
      setStaticLoadingPrefix(""); // Reset prefix for API key verification
      setLoadingMessage(`Verifying API Key from ${source}...`);
      setApiKeyError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-04-17",
          contents: [{ role: "user", parts: [{ text: "hello" }] }],
        });
        setGenAI(ai);
        if (source === "input") {
          localStorage.setItem("geminiApiKey", key);
        }
        setCurrentStep(userInput ? AppStep.MAIN_VIEW : AppStep.USER_DATA_INPUT);
        if (userInput && activeTab) setActiveTab(activeTab);
        else setActiveTab("details");
        return true;
      } catch (error: any) {
        console.error(
          `API Key Initialization Error (source: ${source}):`,
          error
        );
        
        // Check for rate limit error (429)
        if (error.message && error.message.includes('429')) {
          const errorMessage = "🚨 API Rate Limit Reached\n\n" + 
            "You've reached the Gemini API free tier limit (500 requests per day).\n\n" + 
            "Options:\n" +
            "1. Wait until tomorrow when your quota resets\n" +
            "2. Use a different API key\n" +
            "3. Upgrade to a paid tier at Google AI Studio";
          
          setApiKeyError(errorMessage);
        } else if (error.message && error.message.includes('invalid')) {
          setApiKeyError("Invalid API key. Please check your API key and try again.");
        } else {
          setApiKeyError(
            `Failed to initialize API Key from ${source}. ${error.message || 'Check key/network.'}`
          );
        }
        
        setGenAI(null);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const initialize = async () => {
      let keyInitialized = false;
      
      // Try environment variable first
      if (process.env.GEMINI_API_KEY) {
        keyInitialized = await tryInitGenAI(process.env.GEMINI_API_KEY, "env");
      }
      
      // Fall back to localStorage if env var not available
      if (!keyInitialized) {
        const storedKey = localStorage.getItem("geminiApiKey");
        if (storedKey) {
          keyInitialized = await tryInitGenAI(storedKey, "localStorage");
        }
      }
      
      // If neither worked, show API key input screen
      if (!keyInitialized) {
        setCurrentStep(AppStep.API_KEY_INPUT);
        setIsLoading(false);
      }
    };
    initialize();
  }, [tryInitGenAI]);

  const resetAllApplicationData = (keepApiKeySetup = true) => {
    setErrorMessage(null);
    setUserInput(null);
    setIdentifiedSkills([]);
    // setSkillIdentificationAttributions([]);
    setUserRatings({});
    setFocusSkills([]);
    setGrowthPlans([]);
    setSuggestedJobTitles([]);
    // setJobSuggestionAttributions([]);
    setRaters([initialSelfRater]);
    setActiveRaterId(initialSelfRater.id);
    setComparisonRaterIds([initialSelfRater.id]);
    setShowAverageOnRadar(false);
    setActiveTab("details");
    rubricCardRefs.current = {};

    setStaticLoadingPrefix("");
    setLoadingMessageQueue([]);
    setCurrentLoadingMessageIndex(0);

    if (keepApiKeySetup && genAI) {
      setCurrentStep(AppStep.USER_DATA_INPUT);
    } else {
      setCurrentStep(AppStep.API_KEY_INPUT);
      setGenAI(null);
      localStorage.removeItem("geminiApiKey");
    }
    setIsLoading(false);
  };

  const handleApiKeySubmit = useCallback(
    async (apiKeyInput: string) => {
      await tryInitGenAI(apiKeyInput, "input");
    },
    [tryInitGenAI]
  );

  const handleUserInputSubmit = useCallback(
    async (data: UserInputData) => {
      if (!genAI) {
        setErrorMessage(
          "Gemini AI client not initialized. Please ensure the API Key is configured and valid."
        );
        setCurrentStep(AppStep.API_KEY_INPUT);
        return;
      }

      previousRatingsRef.current = JSON.parse(JSON.stringify(userRatings));
      setUserInput(data);
      setCurrentStep(AppStep.PROCESSING);

      setStaticLoadingPrefix("Generating skill candidates: ");
      setLoadingMessageQueue(CYCLING_LOADING_MESSAGES);
      setCurrentLoadingMessageIndex(0);
      // setLoadingMessage is set by useEffect
      setIsLoading(true);
      setErrorMessage(null);

      setFocusSkills([]);
      setGrowthPlans([]);
      setSuggestedJobTitles([]);
      // setJobSuggestionAttributions([]);
      rubricCardRefs.current = {};

      try {
        // Generate skill candidates instead of directly identifying skills
        const response: SkillGenerationResponse =
          await geminiService.generateSkillCandidates(genAI, data);

        // Create skill selection state
        const newSkillSelection: SkillSelectionState = {
          candidates: response.skillCandidates,
          selectedPersonalSkills: response.recommendedFocus.slice(0, 6), // Pre-select top 6
          universalEnablers: response.skillCandidates.filter(skill => skill.isUniversalEnabler),
          maxPersonalSkills: 6
        };

        setSkillSelection(newSkillSelection);
        setCurrentStep(AppStep.SKILL_SELECTION);
        setIsLoading(false);

      } catch (error) {
        console.error("Error generating skill candidates:", error);
        setErrorMessage(
          `Failed to generate skill candidates: ${(error as Error).message}`
        );
        setCurrentStep(AppStep.USER_DATA_INPUT);
      } finally {
        setIsLoading(false);
      }
    },
    [genAI, userRatings, userInput]
  );

  const handleRateSkill = useCallback(
    (skillId: string, rating: RubricLevel) => {
      setUserRatings((prev) => {
        const newRatings = { ...prev };
        const skillRatings = newRatings[skillId]
          ? [...newRatings[skillId]]
          : [];
        const raterIndex = skillRatings.findIndex(
          (r) => r.raterId === activeRaterId
        );

        if (raterIndex > -1) {
          skillRatings[raterIndex] = { ...skillRatings[raterIndex], rating };
        } else {
          skillRatings.push({
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            raterId: activeRaterId,
            rating,
          });
        }
        newRatings[skillId] = skillRatings;
        return newRatings;
      });
    },
    [activeRaterId]
  );

  const getRatingForSkillCard = (skillId: string): RubricLevel | undefined => {
    return userRatings[skillId]?.find((r) => r.raterId === activeRaterId)
      ?.rating;
  };

  const getAllRatingsSummaryForSkill = (skillId: string): string => {
    if (!userRatings[skillId] || userRatings[skillId].length === 0)
      return "No ratings yet.";
    return userRatings[skillId]
      .map((sr) => {
        const raterName =
          raters.find((r) => r.id === sr.raterId)?.name || sr.raterId;
        return `${raterName}: ${sr.rating}`;
      })
      .join("; ");
  };

  const handleSkillToggleFocus = useCallback((skillId: string) => {
    setFocusSkills((prev) => {
      if (prev.includes(skillId)) {
        return prev.filter((id) => id !== skillId);
      }
      if (prev.length < MAX_FOCUS_SKILLS) {
        return [...prev, skillId];
      }
      return prev;
    });
  }, []);

  const handleSkillSelectionChange = useCallback((selectedPersonalSkillIds: string[]) => {
    if (skillSelection) {
      setSkillSelection({
        ...skillSelection,
        selectedPersonalSkills: selectedPersonalSkillIds
      });
    }
  }, [skillSelection]);

  const handleSkillSelectionComplete = useCallback(async (selectedPersonalSkillIds: string[]) => {
    if (!skillSelection || !genAI) return;

    setCurrentStep(AppStep.PROCESSING);
    setStaticLoadingPrefix("Processing selected skills: ");
    setLoadingMessageQueue(CYCLING_LOADING_MESSAGES);
    setCurrentLoadingMessageIndex(0);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Combine selected personal skills with universal enablers for active skills
      const allSelectedSkills = [
        ...skillSelection.universalEnablers,
        ...skillSelection.candidates.filter(skill => 
          selectedPersonalSkillIds.includes(skill.id) && !skill.isUniversalEnabler
        )
      ];

      // Convert ALL candidates to IdentifiedSkillData[] for the skill bank
      const allSkillsData: IdentifiedSkillData[] = skillSelection.candidates.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        rubric: skill.rubric,
        isUniversalEnabler: skill.isUniversalEnabler || false,
      }));

      // Convert selected skills to IdentifiedSkillData[] for current active skills
      const identifiedSkillsData: IdentifiedSkillData[] = allSelectedSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        rubric: skill.rubric,
        isUniversalEnabler: skill.isUniversalEnabler
      }));

      // Update ratings to preserve any existing ratings for these skills
      const updatedRatings: UserRatingsData = {};
      allSkillsData.forEach((skill) => {
        if (previousRatingsRef.current[skill.id]) {
          updatedRatings[skill.id] = previousRatingsRef.current[skill.id];
        }
      });

      // Set up skill bank with ALL generated skills and selected active skills
      setSkillBank({
        activeSkills: identifiedSkillsData.map(skill => skill.id),
        masteredSkills: [],
        allSkillsData: allSkillsData
      });

      // Initialize skill statuses
      const initialStatuses: Record<string, SkillStatus> = {};
      allSkillsData.forEach(skill => {
        if (identifiedSkillsData.find(activeSkill => activeSkill.id === skill.id)) {
          initialStatuses[skill.id] = SkillStatus.ACTIVE;
        } else {
          initialStatuses[skill.id] = SkillStatus.INACTIVE;
        }
      });
      setSkillStatuses(initialStatuses);

      setUserRatings(updatedRatings);
      setCurrentStep(AppStep.MAIN_VIEW);
      setActiveTab("radar");

    } catch (error) {
      console.error("Error processing skill selection:", error);
      setErrorMessage(`Failed to process skill selection: ${(error as Error).message}`);
      setCurrentStep(AppStep.SKILL_SELECTION);
    } finally {
      setIsLoading(false);
    }
  }, [skillSelection, genAI, userRatings]);

  const handleGenerateGrowthPlansAndJobs = useCallback(async () => {
    if (!genAI || focusSkills.length === 0 || !userInput) return;

    setIsLoading(true);
    setErrorMessage(null);
    setGrowthPlans([]);
    setSuggestedJobTitles([]);
    // setJobSuggestionAttributions([]);

    setStaticLoadingPrefix("Suggesting job titles: ");
    setLoadingMessageQueue(CYCLING_LOADING_MESSAGES);
    setCurrentLoadingMessageIndex(0);
    // setLoadingMessage is set by useEffect

    let currentSuggestedTitles: string[] = [];

    try {
      const skillsForJobSuggestion = identifiedSkills
        .map((skill) => {
          const selfRating = userRatings[skill.id]?.find(
            (r) => r.raterId === SELF_ASSESSMENT_RATER_ID
          )?.rating;
          if (selfRating) return { skillName: skill.name, rating: selfRating };
          const activeRaterRating = userRatings[skill.id]?.find(
            (r) => r.raterId === activeRaterId
          )?.rating;
          if (activeRaterRating)
            return { skillName: skill.name, rating: activeRaterRating };
          const firstAvailableRating = userRatings[skill.id]?.[0]?.rating;
          if (firstAvailableRating)
            return { skillName: skill.name, rating: firstAvailableRating };
          return null;
        })
        .filter((sr) => sr !== null) as {
        skillName: string;
        rating: RubricLevel;
      }[];

      if (skillsForJobSuggestion.length > 0) {
        const jobResponse: SuggestedJobsResponse =
          await geminiService.suggestJobTitles(genAI, skillsForJobSuggestion);
        currentSuggestedTitles = jobResponse.titles;
        setSuggestedJobTitles(currentSuggestedTitles);
        // setJobSuggestionAttributions(jobResponse.searchAttributions || []);
      } else {
        setSuggestedJobTitles([]);
      }

      const plans: GrowthPlan[] = [];
      for (const skillId of focusSkills) {
        const skill = identifiedSkills.find((s) => s.id === skillId);
        let ratingEntry = userRatings[skillId]?.find(
          (r) => r.raterId === SELF_ASSESSMENT_RATER_ID
        );
        if (!ratingEntry)
          ratingEntry = userRatings[skillId]?.find(
            (r) => r.raterId === activeRaterId
          );
        if (!ratingEntry) ratingEntry = userRatings[skillId]?.[0];

        if (skill && ratingEntry) {
          setStaticLoadingPrefix(
            `Generating growth plan for "${skill.name}": `
          );
          setCurrentLoadingMessageIndex(0); // Restart cycle for this skill
          // setLoadingMessage is set by useEffect

          const plan = await geminiService.generateGrowthPlan(
            genAI,
            skill.name,
            ratingEntry.rating,
            userInput.aspirationsGoals,
            currentSuggestedTitles
          );
          plans.push(plan);
        }
      }
      setGrowthPlans(plans);
    } catch (error) {
      console.error("Error during growth plan/job generation:", error);
      setErrorMessage(
        `Error generating growth content: ${(error as Error).message}`
      );
    } finally {
      setIsLoading(false);
      setLoadingMessageQueue([]);
      setStaticLoadingPrefix("");
    }
  }, [
    genAI,
    focusSkills,
    identifiedSkills,
    userRatings,
    userInput,
    activeRaterId,
  ]);

  const handleAddRater = (name: string) => {
    if (
      name.trim() &&
      !raters.find((r) => r.name.toLowerCase() === name.trim().toLowerCase())
    ) {
      const newRater: Rater = {
        id: `rater_${Date.now()}`,
        name: name.trim(),
        isSelf: false,
      };
      setRaters((prev) => [...prev, newRater]);
      setErrorMessage(null);
    } else if (!name.trim()) {
      setErrorMessage("Rater name cannot be empty.");
    } else {
      setErrorMessage("Rater name already exists. Please use a unique name.");
    }
  };

  const handleToggleComparisonRater = useCallback(
    (raterId: string) => {
      setComparisonRaterIds((prev) => {
        let newSelection;
        if (prev.includes(raterId)) {
          newSelection = prev.filter((id) => id !== raterId);
        } else {
          newSelection = [...prev, raterId];
        }
        if (newSelection.length === 0) {
          const selfRater = raters.find(
            (r) => r.id === SELF_ASSESSMENT_RATER_ID
          );
          if (
            selfRater &&
            raters.some((r) => r.id === SELF_ASSESSMENT_RATER_ID)
          )
            return [SELF_ASSESSMENT_RATER_ID];
          if (raters.length > 0) return [raters[0].id];
          return [];
        }
        return newSelection;
      });
    },
    [raters]
  );

  const handleToggleShowAverage = useCallback(() => {
    setShowAverageOnRadar((prev) => !prev);
  }, []);

  const prepareRadarChartData = useCallback(() => {
    const chartDataForRecharts: any[] = [];
    const seriesInfoForChart: RadarDisplaySeries[] = [];

    if (
      !identifiedSkills ||
      identifiedSkills.length === 0 ||
      comparisonRaterIds.length === 0
    ) {
      return { chartDataForRecharts: [], seriesInfoForChart: [] };
    }

    const activeComparisonRatersDetails = comparisonRaterIds
      .map((id) => raters.find((r) => r.id === id))
      .filter((r): r is Rater => r !== undefined);

    let seriesColorIndex = 0;
    activeComparisonRatersDetails.forEach((rater) => {
      const seriesKey = `rater_${rater.id}`;
      let raterColor: string;

      if (rater.id === SELF_ASSESSMENT_RATER_ID) {
        raterColor = SELF_ASSESSMENT_COLOR;
      } else {
        raterColor =
          RADAR_SERIES_COLORS[seriesColorIndex % RADAR_SERIES_COLORS.length];
        seriesColorIndex++;
      }
      seriesInfoForChart.push({
        key: seriesKey,
        name: rater.name,
        color: raterColor,
      });
    });

    if (showAverageOnRadar && activeComparisonRatersDetails.length >= 2) {
      seriesInfoForChart.push({
        key: "average",
        name: "Average",
        color: RADAR_AVERAGE_COLOR,
        isAverage: true,
      });
    }

    identifiedSkills.forEach((skill) => {
      const skillEntry: any = {
        subject: skill.name,
        skillId: skill.id,
        fullMark: MAX_RUBRIC_LEVEL_VALUE,
      };

      activeComparisonRatersDetails.forEach((rater) => {
        const seriesKey = `rater_${rater.id}`;
        const ratingEntry = userRatings[skill.id]?.find(
          (r) => r.raterId === rater.id
        );
        skillEntry[seriesKey] = ratingEntry
          ? RUBRIC_LEVEL_MAP[ratingEntry.rating]
          : 0;
      });

      if (showAverageOnRadar && activeComparisonRatersDetails.length >= 2) {
        let sumRatings = 0;
        let countRatings = 0;
        activeComparisonRatersDetails.forEach((rater) => {
          const ratingEntry = userRatings[skill.id]?.find(
            (r) => r.raterId === rater.id // Fix: use rater.id instead of r.id
          );
          if (ratingEntry) {
            sumRatings += RUBRIC_LEVEL_MAP[ratingEntry.rating];
            countRatings++;
          }
        });
        skillEntry["average"] =
          countRatings > 0
            ? parseFloat((sumRatings / countRatings).toFixed(2))
            : 0;
      }
      chartDataForRecharts.push(skillEntry);
    });

    return { chartDataForRecharts, seriesInfoForChart };
  }, [
    identifiedSkills,
    userRatings,
    comparisonRaterIds,
    showAverageOnRadar,
    raters,
  ]);

  const handleExportData = () => {
    const exportData: AppExportDataV2 = {
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      userInput,
      skillSelection: skillSelection || undefined,
      skillBank,
      skillStatuses,
      raters,
      userRatings,
      focusSkills,
      growthPlans,
      suggestedJobTitles,
      theme,
      activeTab: currentStep === AppStep.MAIN_VIEW ? activeTab : undefined,
      activeRaterId:
        currentStep === AppStep.MAIN_VIEW ? activeRaterId : undefined,
      comparisonRaterIds:
        currentStep === AppStep.MAIN_VIEW ? comparisonRaterIds : undefined,
      showAverageOnRadar:
        currentStep === AppStep.MAIN_VIEW ? showAverageOnRadar : undefined,
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai_skills_radar_data_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
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
        const importedData = JSON.parse(jsonString) as AppExportData | AppExportDataV2;

        if (!importedData || typeof importedData !== "object")
          throw new Error("Invalid file format.");

        // Check if this is the new format (has skillBank) or old format (has identifiedSkills)
        const isNewFormat = 'skillBank' in importedData;
        
        if (isNewFormat) {
          const newData = importedData as AppExportDataV2;
          if (!newData.skillBank || !Array.isArray(newData.skillBank.allSkillsData))
            throw new Error("Missing or invalid 'skillBank'.");
          
          // Set skill bank data
          setSkillBank(newData.skillBank);
          setSkillStatuses(newData.skillStatuses || {});
        } else {
          const oldData = importedData as AppExportData;
          if (!Array.isArray(oldData.identifiedSkills))
            throw new Error("Missing or invalid 'identifiedSkills'.");
          
          // Convert old format to new format
          setSkillBank({
            activeSkills: oldData.identifiedSkills.map(s => s.id),
            masteredSkills: [],
            allSkillsData: oldData.identifiedSkills
          });
          
          // Initialize all skills as active
          const newStatuses: Record<string, SkillStatus> = {};
          oldData.identifiedSkills.forEach(skill => {
            newStatuses[skill.id] = SkillStatus.ACTIVE;
          });
          setSkillStatuses(newStatuses);
        }

        let importedRaters = importedData.raters;
        if (
          !Array.isArray(importedRaters) ||
          importedRaters.length === 0 ||
          !importedRaters.every(
            (r) =>
              typeof r.id === "string" &&
              typeof r.name === "string" &&
              typeof r.isSelf === "boolean"
          )
        ) {
          importedRaters = [initialSelfRater];
        }
        if (
          !importedRaters.find(
            (r) => r.id === SELF_ASSESSMENT_RATER_ID && r.isSelf
          )
        ) {
          const existingSelf = importedRaters.find((r) => r.isSelf);
          if (existingSelf) existingSelf.id = SELF_ASSESSMENT_RATER_ID;
          else importedRaters.unshift(initialSelfRater);
        }

        setUserInput(importedData.userInput || null);
        setSkillSelection(importedData.skillSelection || null);
        // setSkillIdentificationAttributions([]);
        setRaters(importedRaters);
        setUserRatings(importedData.userRatings || {});
        setFocusSkills(importedData.focusSkills || []);
        setGrowthPlans(importedData.growthPlans || []);
        setSuggestedJobTitles(importedData.suggestedJobTitles || []);
        // setJobSuggestionAttributions([]);
        rubricCardRefs.current = {};

        let raterIdToRestore = SELF_ASSESSMENT_RATER_ID;
        if (importedRaters.length > 0) {
          raterIdToRestore =
            importedRaters.find((r) => r.isSelf)?.id || importedRaters[0].id;
          if (
            importedData.activeRaterId &&
            importedRaters.find((r) => r.id === importedData.activeRaterId)
          ) {
            raterIdToRestore = importedData.activeRaterId;
          }
        }
        setActiveRaterId(raterIdToRestore);

        let importedComparisonIds = importedData.comparisonRaterIds;
        if (
          !Array.isArray(importedComparisonIds) ||
          importedComparisonIds.length === 0 ||
          !importedComparisonIds.every((id) =>
            importedRaters.some((r) => r.id === id)
          )
        ) {
          importedComparisonIds = [raterIdToRestore];
        }
        setComparisonRaterIds(importedComparisonIds);
        setShowAverageOnRadar(
          importedData.showAverageOnRadar === true ? true : false
        );

        setErrorMessage(null);

        // Check if we have skills to display (from either format)
        const hasSkills = isNewFormat 
          ? (importedData as AppExportDataV2).skillBank.allSkillsData.length > 0
          : (importedData as AppExportData).identifiedSkills.length > 0;

        // Move directly to the main view if there's data to display, regardless of API key status
        if (hasSkills) {
          setCurrentStep(AppStep.MAIN_VIEW);
          setActiveTab(importedData.activeTab || "radar");
          
          // Show a warning if no API key, but don't block viewing the data
          if (!genAI) {
            setErrorMessage(
              "Data imported. Note: You can view the imported data, but you'll need an API key to generate new content."
            );
          }
        } else if (importedData.userInput) {
          setCurrentStep(AppStep.MAIN_VIEW);
          setActiveTab("details");
          
          if (!genAI) {
            setErrorMessage(
              "Data imported. Note: You can view the imported data, but you'll need an API key to generate new content."
            );
          }
        } else {
          // If there's truly no data to display, show the appropriate screen based on API key status
          if (!genAI) {
            setCurrentStep(AppStep.API_KEY_INPUT);
            setErrorMessage("Data imported, but no skills were found. Please add an API key to generate content.");
          } else {
            setCurrentStep(AppStep.USER_DATA_INPUT);
          }
        }

        // Patch for legacy imports: ensure new fields exist
        setUserInput({
          hardSkills: importedData.userInput?.hardSkills || '',
          resumeInfo: importedData.userInput?.resumeInfo || '',
          aspirationsThrive: importedData.userInput?.aspirationsThrive || '',
          aspirationsGoals: importedData.userInput?.aspirationsGoals || '',
          teamStrategy: importedData.userInput?.teamStrategy || '',
          companyStrategy: importedData.userInput?.companyStrategy || '',
        });
      } catch (err) {
        console.error("Error importing data:", err);
        setErrorMessage(
          `Failed to import data: ${
            (err as Error).message
          }. Ensure the file is valid.`
        );
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const triggerImport = () => fileInputRef.current?.click();

  const handleRadarSkillClick = useCallback(
    (skillId: string) => {
      const skillCardElement = rubricCardRefs.current[skillId];
      if (skillCardElement) {
        skillCardElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        if (activeTab !== "radar") {
          setActiveTab("radar");
        }
      }
    },
    [activeTab]
  );

  const renderMainViewContent = () => {
    const { chartDataForRecharts, seriesInfoForChart } =
      prepareRadarChartData();

    // isLoading check for specific phases (skill ID or growth plan generation)
    const isProcessingSkills =
      isLoading && staticLoadingPrefix.startsWith("Identifying skills:");
    const isProcessingGrowth =
      isLoading &&
      (staticLoadingPrefix.startsWith("Suggesting job titles:") ||
        staticLoadingPrefix.startsWith("Generating growth plan for"));

    switch (activeTab) {
      case "details":
        return (
          <TabDetails
            onSubmit={handleUserInputSubmit}
            loading={isProcessingSkills}
            initialData={userInput}
          />
        );
      case "radar":
        return (
          <TabRadar
            raters={raters}
            activeRaterId={activeRaterId}
            onAddRater={handleAddRater}
            onSelectRater={setActiveRaterId}
            comparisonRaterIds={comparisonRaterIds}
            onToggleComparisonRater={handleToggleComparisonRater}
            showAverageOnRadar={showAverageOnRadar}
            onToggleShowAverage={handleToggleShowAverage}
            chartDataForRecharts={chartDataForRecharts}
            seriesInfoForChart={seriesInfoForChart}
            theme={theme}
            onSkillLabelClick={handleRadarSkillClick}
            identifiedSkills={identifiedSkills}
            getRatingForSkillCard={getRatingForSkillCard}
            handleRateSkill={handleRateSkill}
            getAllRatingsSummaryForSkill={getAllRatingsSummaryForSkill}
            isProcessingSkills={isProcessingSkills}
            loadingMessage={loadingMessage}
            rubricCardRefs={rubricCardRefs}
            skillStatuses={skillStatuses}
            onMarkSkillAsMastered={handleMarkSkillAsMastered}
            onSwapSkill={handleSwapSkill}
            checkSkillMastery={checkSkillMastery}
            getAvailableSkillsForSwap={getAvailableSkillsForSwap}
          />
        );
      case "growth":
        return (
          <TabGrowth
            identifiedSkills={identifiedSkills}
            focusSkills={focusSkills}
            onSkillToggleFocus={handleSkillToggleFocus}
            isProcessingGrowth={isProcessingGrowth}
            suggestedJobTitles={suggestedJobTitles}
            growthPlans={growthPlans}
            loadingMessage={loadingMessage}
            handleGenerateGrowthPlansAndJobs={handleGenerateGrowthPlansAndJobs}
            genAI={genAI}
          />
        );
      case "radarAndRubrics": {
        return (
          <TabRadarAndRubrics
            skills={identifiedSkills}
            radarData={seriesInfoForChart}
            chartDataForRecharts={chartDataForRecharts}
            theme={theme}
          />
        );
      }
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (currentStep === AppStep.API_KEY_INPUT) {
      return (
        <>
          <ApiKeyInput
            onApiKeySubmit={handleApiKeySubmit}
            loading={isLoading && loadingMessage.includes("Verifying API Key")}
            error={apiKeyError}
            onTriggerImport={triggerImport}
          />
        </>
      );
    }

    const isProcessingSkillsForUserInput =
      isLoading && (staticLoadingPrefix.startsWith("Generating skill candidates:") || staticLoadingPrefix.startsWith("Processing selected skills:"));
    const isInitializingAPI =
      isLoading && loadingMessage.includes("Initializing API");

    if (
      (currentStep === AppStep.PROCESSING && isProcessingSkillsForUserInput) ||
      (currentStep === AppStep.PROCESSING && isInitializingAPI)
    ) {
      return <LoadingIndicator message={loadingMessage} />;
    }

    if (
      isLoading &&
      currentStep === AppStep.PROCESSING &&
      !genAI &&
      !userInput
    ) {
      // Initial app load before API key check
      return (
        <LoadingIndicator
          message={loadingMessage || "Initializing application..."}
        />
      );
    }

    if (currentStep === AppStep.USER_DATA_INPUT) {
      return (
        <TabDetails
          onSubmit={handleUserInputSubmit}
          loading={isProcessingSkillsForUserInput}
          initialData={userInput}
        />
      );
    }

    if (currentStep === AppStep.SKILL_SELECTION) {
      if (!skillSelection) {
        return <LoadingIndicator message="Preparing skill selection..." />;
      }
      return (
        <SkillSelectionInterface
          skillSelection={skillSelection}
          onSelectionChange={handleSkillSelectionChange}
          onComplete={handleSkillSelectionComplete}
          loading={isLoading}
        />
      );
    }

    if (currentStep === AppStep.MAIN_VIEW) {
      return (
        <div className="print-main-container bg-white dark:bg-gray-800 shadow-xl rounded-lg p-2 md:p-6">
          <div className="px-0 py-0">
            {renderMainViewContent()}
          </div>
        </div>
      );
    }

    if (isLoading)
      return (
        <LoadingIndicator
          message={loadingMessage || "Loading application..."}
        />
      );

    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} loading={false} error={apiKeyError} />;
  };

  // Skill Mastery and Swapping Functions
  const checkSkillMastery = useCallback((skillId: string): SkillMasteryCheck => {
    const skillRatings = userRatings[skillId] || [];
    const selfRating = skillRatings.find(r => r.raterId === SELF_ASSESSMENT_RATER_ID);
    const otherRatings = skillRatings.filter(r => r.raterId !== SELF_ASSESSMENT_RATER_ID);
    
    // Count ratings at Advanced (3) or Expert (4) level
    const highRatings = skillRatings.filter(r => 
      r.rating === RubricLevel.ADVANCED || r.rating === RubricLevel.EXPERT
    );
    
    // Criteria: Self + at least 3 others all at Advanced/Expert level
    const hasSelfHighRating = selfRating && (
      selfRating.rating === RubricLevel.ADVANCED || 
      selfRating.rating === RubricLevel.EXPERT
    );
    const hasEnoughOtherHighRatings = otherRatings.filter(r => 
      r.rating === RubricLevel.ADVANCED || r.rating === RubricLevel.EXPERT
    ).length >= 3;
    
    const canBeMastered = Boolean(hasSelfHighRating && hasEnoughOtherHighRatings);
    
    return {
      skillId,
      canBeMastered,
      ratingsSummary: {
        selfRating: selfRating?.rating,
        otherRatings: otherRatings.map(r => ({
          raterId: r.raterId,
          raterName: raters.find(rater => rater.id === r.raterId)?.name || r.raterId,
          rating: r.rating
        })),
        totalHighRatings: highRatings.length
      }
    };
  }, [userRatings, raters]);

  const getAvailableSkillsForSwap = useCallback((): IdentifiedSkillData[] => {
    // Return all skills that are not currently active - this includes both mastered and inactive skills
    const activeSkillIds = new Set(skillBank.activeSkills);
    return skillBank.allSkillsData.filter(skill => !activeSkillIds.has(skill.id));
  }, [skillBank]);

  const handleMarkSkillAsMastered = useCallback((skillId: string) => {
    const masteryCheck = checkSkillMastery(skillId);
    if (!masteryCheck.canBeMastered) {
      setErrorMessage("This skill doesn't meet the mastery criteria (self + 3 others at Advanced/Expert level)");
      return;
    }

    setSkillBank(prev => ({
      ...prev,
      activeSkills: prev.activeSkills.filter(id => id !== skillId),
      masteredSkills: [...prev.masteredSkills, skillId]
    }));
    
    setSkillStatuses(prev => ({
      ...prev,
      [skillId]: SkillStatus.MASTERED
    }));

    // Remove from focus skills if present
    setFocusSkills(prev => prev.filter(id => id !== skillId));
    
    setErrorMessage(null);
  }, [checkSkillMastery]);

  const handleSwapSkill = useCallback((removeSkillId: string, addSkillId: string) => {
    // Free swapping - no mastery requirements, just swap active skills
    setSkillBank(prev => ({
      ...prev,
      activeSkills: prev.activeSkills.map(id => id === removeSkillId ? addSkillId : id)
    }));
    
    // Update skill statuses
    setSkillStatuses(prev => ({
      ...prev,
      [removeSkillId]: SkillStatus.INACTIVE, // Mark removed skill as inactive
      [addSkillId]: SkillStatus.ACTIVE        // Mark new skill as active
    }));

    // Update focus skills if the removed skill was a focus skill
    setFocusSkills(prev => prev.includes(removeSkillId) 
      ? prev.map(id => id === removeSkillId ? addSkillId : id)
      : prev
    );
     setErrorMessage(null);
  }, [skillBank, setSkillStatuses, setFocusSkills]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex gap-2 md:gap-4 items-end">
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary-700 dark:text-primary-500 tracking-tight truncate">
                  {APP_TITLE}
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
                  Align yourself with market demands.
                </p>
              </div>
              {currentStep === AppStep.MAIN_VIEW && <RateLimitInfo theme={theme} className="mt-1" />}
            </div>
            
            {/* Navigation and Options - Always show options dropdown */}
            <div className="flex items-center gap-4 ml-4">
              <HeaderNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                currentStep={currentStep}
                onExportData={handleExportData}
                onStartOver={() => resetAllApplicationData(genAI !== null)}
                fileInputRef={fileInputRef}
                exportDisabled={!userInput && (!identifiedSkills || identifiedSkills.length === 0)}
              />
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>
        </div>
      </header>

      {/* Hidden file input for import functionality */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportData}
        accept=".json"
        className="hidden"
        aria-hidden="true"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div
            className="mb-6 p-4 bg-red-100 border-red-400 text-red-700 rounded-md shadow-md dark:bg-red-900 dark:border-red-700 dark:text-red-300 print-hide"
            role="alert"
          >
            <strong className="font-bold">Error: </strong> {errorMessage}
          </div>
        )}
        {renderContent()}
      </main>
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
