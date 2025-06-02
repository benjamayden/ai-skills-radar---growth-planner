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
  SkillRatingEntry,
  UserRatingsData,
  AppExportData,
  RUBRIC_LEVEL_MAP,
  RadarDisplaySeries,
  MAX_RUBRIC_LEVEL_VALUE,
  SELF_ASSESSMENT_RATER_ID,
  GroundingChunk,
  SuggestedJobsResponse,
  ProcessedSkillsResponse,
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
import UserInputForm from "./components/UserInputForm";
import LoadingIndicator from "./components/LoadingIndicator";
import SkillsRadarChart from "./components/SkillsRadarChart";
import SkillRubricCard from "./components/SkillRubricCard";
import FocusSkillsSelector from "./components/FocusSkillsSelector";
import GrowthPlanDisplay from "./components/GrowthPlanDisplay";
import SuggestedJobs from "./components/SuggestedJobs";
import RaterManager from "./components/RaterManager";
import ThemeToggle from "./components/ThemeToggle";

const APP_VERSION = "1.11.0"; // Version for Rubric Cleanup & Loading Msg Cycle

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

  const [identifiedSkills, setIdentifiedSkills] = useState<
    IdentifiedSkillData[]
  >([]);
  const [skillIdentificationAttributions, setSkillIdentificationAttributions] =
    useState<GroundingChunk[]>([]);

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
  const [jobSuggestionAttributions, setJobSuggestionAttributions] = useState<
    GroundingChunk[]
  >([]);

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
      } catch (error) {
        console.error(
          `API Key Initialization Error (source: ${source}):`,
          error
        );
        setApiKeyError(
          `Failed to initialize API Key from ${source}. Check key/network.`
        );
        setGenAI(null);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userInput, activeTab]
  );

  useEffect(() => {
    const initialize = async () => {
      let keyInitialized = false;
      if (process.env.API_KEY) {
        keyInitialized = await tryInitGenAI(process.env.API_KEY, "env");
      }
      if (!keyInitialized) {
        const storedKey = localStorage.getItem("geminiApiKey");
        if (storedKey) {
          keyInitialized = await tryInitGenAI(storedKey, "localStorage");
        }
      }
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
    setSkillIdentificationAttributions([]);
    setUserRatings({});
    setFocusSkills([]);
    setGrowthPlans([]);
    setSuggestedJobTitles([]);
    setJobSuggestionAttributions([]);
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

      setStaticLoadingPrefix("Identifying skills: ");
      setLoadingMessageQueue(CYCLING_LOADING_MESSAGES);
      setCurrentLoadingMessageIndex(0);
      // setLoadingMessage is set by useEffect
      setIsLoading(true);
      setErrorMessage(null);

      setFocusSkills([]);
      setGrowthPlans([]);
      setSuggestedJobTitles([]);
      setJobSuggestionAttributions([]);
      rubricCardRefs.current = {};

      try {
        const response: ProcessedSkillsResponse =
          await geminiService.identifySkillsAndGenerateRubrics(genAI, data);
        const newSkills = response.skills;
        setSkillIdentificationAttributions(response.searchAttributions || []);

        const updatedRatings: UserRatingsData = {};
        if (newSkills && Array.isArray(newSkills)) {
          newSkills.forEach((newSkill) => {
            if (previousRatingsRef.current[newSkill.id]) {
              updatedRatings[newSkill.id] =
                previousRatingsRef.current[newSkill.id];
            }
          });
        }

        setIdentifiedSkills(newSkills || []);
        setUserRatings(updatedRatings);

        if (newSkills && newSkills.length > 0) {
          setCurrentStep(AppStep.MAIN_VIEW);
          setActiveTab("radar");
        } else {
          setErrorMessage(
            "No skills were identified. Please try refining your input, or check the AI's search capabilities."
          );
          setCurrentStep(
            userInput ? AppStep.MAIN_VIEW : AppStep.USER_DATA_INPUT
          );
          setActiveTab("details");
        }
      } catch (error) {
        console.error("Error identifying skills:", error);
        setErrorMessage(
          `Error identifying skills: ${
            (error as Error).message
          }. You might want to try modifying your input or check the console.`
        );
        setCurrentStep(userInput ? AppStep.MAIN_VIEW : AppStep.USER_DATA_INPUT);
        setActiveTab("details");
      } finally {
        setIsLoading(false);
        setLoadingMessageQueue([]);
        setStaticLoadingPrefix("");
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
          skillRatings.push({ raterId: activeRaterId, rating });
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

  const handleGenerateGrowthPlansAndJobs = useCallback(async () => {
    if (!genAI || focusSkills.length === 0 || !userInput) return;

    setIsLoading(true);
    setErrorMessage(null);
    setGrowthPlans([]);
    setSuggestedJobTitles([]);
    setJobSuggestionAttributions([]);

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
        setJobSuggestionAttributions(jobResponse.searchAttributions || []);
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
          (r) => r.raterId === r.id
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
            (r) => r.raterId === r.id
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
        const importedData = JSON.parse(jsonString) as AppExportData;

        if (!importedData || typeof importedData !== "object")
          throw new Error("Invalid file format.");
        if (!Array.isArray(importedData.identifiedSkills))
          throw new Error("Missing or invalid 'identifiedSkills'.");

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
        setIdentifiedSkills(importedData.identifiedSkills || []);
        setSkillIdentificationAttributions([]);
        setRaters(importedRaters);
        setUserRatings(importedData.userRatings || {});
        setFocusSkills(importedData.focusSkills || []);
        setGrowthPlans(importedData.growthPlans || []);
        setSuggestedJobTitles(importedData.suggestedJobTitles || []);
        setJobSuggestionAttributions([]);
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

        if (!genAI) {
          setCurrentStep(AppStep.API_KEY_INPUT);
          setErrorMessage(
            "Data imported. Please verify/enter your API key to enable AI features."
          );
        } else if (
          importedData.userInput &&
          importedData.identifiedSkills.length > 0
        ) {
          setCurrentStep(AppStep.MAIN_VIEW);
          setActiveTab(importedData.activeTab || "radar");
        } else if (importedData.userInput) {
          setCurrentStep(AppStep.MAIN_VIEW);
          setActiveTab("details");
        } else {
          setCurrentStep(AppStep.USER_DATA_INPUT);
        }
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
  const handlePrintForFeedback = () => window.print();

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

  const TabButton: React.FC<{
    tabId: ActiveTabType;
    currentTab: ActiveTabType;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ tabId, currentTab, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 print-hide
        ${
          currentTab === tabId
            ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
            : "text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      aria-current={currentTab === tabId ? "page" : undefined}
    >
      {children}
    </button>
  );

  const renderMainViewContent = () => {
    const activeRaterForRubricDisplay =
      raters.find((r) => r.id === activeRaterId) || initialSelfRater;
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
          <UserInputForm
            onSubmit={handleUserInputSubmit}
            loading={isProcessingSkills}
            initialData={userInput}
          />
        );
      case "radar":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 space-y-6 radar-column-print">
              <RaterManager
                raters={raters}
                activeRaterId={activeRaterId}
                onAddRater={handleAddRater}
                onSelectRater={setActiveRaterId}
                comparisonRaterIds={comparisonRaterIds}
                onToggleComparisonRater={handleToggleComparisonRater}
                showAverageOnRadar={showAverageOnRadar}
                onToggleShowAverage={handleToggleShowAverage}
                className="print-hide"
              />
              <SkillsRadarChart
                chartDataForRecharts={chartDataForRecharts}
                seriesInfoForChart={seriesInfoForChart}
                theme={theme}
                onSkillLabelClick={handleRadarSkillClick}
              />
              <div className="print-skills-list hidden print:block space-y-1 mt-4">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Skills Overview ({activeRaterForRubricDisplay.name}):
                </h4>
                {identifiedSkills.map((skill) => {
                  const rating = getRatingForSkillCard(skill.id);
                  return (
                    <div
                      key={skill.id}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      <strong>{skill.name}:</strong> {rating || "Not Rated"}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handlePrintForFeedback}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md print-hide"
              >
                Print Rubrics & Active Rater Overview
              </button>
            </div>
            <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 rubrics-column-print">
              <div className="hidden print:block print-only-header mb-4 p-2 border-b border-gray-300">
                <p className="text-sm">
                  <strong>Rater for Rubrics:</strong>{" "}
                  {activeRaterForRubricDisplay.name}
                </p>
              </div>
              {isProcessingSkills ? (
                <LoadingIndicator message={loadingMessage} />
              ) : identifiedSkills.length > 0 ? (
                identifiedSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="skill-rubric-card-print-wrapper"
                    ref={(el) => {
                      rubricCardRefs.current[skill.id] = el;
                    }}
                  >
                    <SkillRubricCard
                      skillData={skill}
                      currentRatingForActiveRater={getRatingForSkillCard(
                        skill.id
                      )}
                      onRateSkill={handleRateSkill}
                      allRatingsSummary={getAllRatingsSummaryForSkill(skill.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">
                  No skills identified yet. Go to "My Details" to generate
                  skills.
                </p>
              )}
            </div>
          </div>
        );
      case "growth":
        return (
          <div className="space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FocusSkillsSelector
                skills={identifiedSkills}
                selectedSkills={focusSkills}
                onSkillToggle={handleSkillToggleFocus}
              />
              {!isProcessingGrowth && suggestedJobTitles.length > 0 && (
                <div className="results-section-jobs suggested-jobs-print">
                  <SuggestedJobs jobTitles={suggestedJobTitles} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <button
                onClick={handleGenerateGrowthPlansAndJobs}
                disabled={focusSkills.length === 0 || isLoading || !genAI}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out print-hide"
              >
                {isProcessingGrowth
                  ? "Generating..."
                  : "Generate Growth Plans & Job Suggestions"}
              </button>
              {isProcessingGrowth && (
                <LoadingIndicator message={loadingMessage} />
              )}

              {!isProcessingGrowth && growthPlans.length > 0 && (
                <div className="results-section-growth-plans">
                  <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 mt-8">
                    Personalized Growth Plans
                  </h3>
                  {growthPlans.map((plan, index) => (
                    <div key={index} className="growth-plan-display-item-print">
                      <GrowthPlanDisplay growthPlans={[plan]} />
                    </div>
                  ))}
                </div>
              )}

              {!isProcessingGrowth &&
                focusSkills.length > 0 &&
                growthPlans.length === 0 &&
                suggestedJobTitles.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                    Select focus skills and click "Generate" to see your growth
                    plan and job suggestions. {!genAI && "API Key needed."}
                  </p>
                )}
              {identifiedSkills.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                  Please generate skills from the "My Details" tab first.
                </p>
              )}
            </div>
          </div>
        );
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
          />
          {apiKeyError && (
            <p className="mt-4 text-center text-red-600 dark:text-red-400">
              {apiKeyError}
            </p>
          )}
        </>
      );
    }

    const isProcessingSkillsForUserInput =
      isLoading && staticLoadingPrefix.startsWith("Identifying skills:");
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
        <UserInputForm
          onSubmit={handleUserInputSubmit}
          loading={isProcessingSkillsForUserInput}
          initialData={userInput}
        />
      );
    }

    if (currentStep === AppStep.MAIN_VIEW) {
      return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-0 md:p-2">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6 print-hide">
            <nav
              className="-mb-px flex space-x-0 md:space-x-4"
              aria-label="Tabs"
            >
              <TabButton
                tabId="details"
                currentTab={activeTab}
                onClick={() => setActiveTab("details")}
              >
                My Details
              </TabButton>
              <TabButton
                tabId="radar"
                currentTab={activeTab}
                onClick={() => setActiveTab("radar")}
              >
                Skills Radar & Rubrics
              </TabButton>
              <TabButton
                tabId="growth"
                currentTab={activeTab}
                onClick={() => setActiveTab("growth")}
              >
                Growth Plan
              </TabButton>
            </nav>
          </div>
          <div className="px-0 py-0 md:px-6 md:py-4">
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

    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} loading={false} />;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <header className="mb-6 relative print-hide">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-700 dark:text-primary-500 tracking-tight">
            {APP_TITLE}
          </h1>
          <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover your strengths, identify growth areas, and align your
            career with market demands.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-1 flex space-x-1">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <div
        className={`${
          currentStep === AppStep.MAIN_VIEW ? "max-w-7xl" : "max-w-xl"
        } mx-auto`}
      >
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
            disabled={
              !userInput && (!identifiedSkills || identifiedSkills.length === 0)
            }
          >
            Export Data (JSON)
          </button>
          <button
            onClick={triggerImport}
            className="px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Import Data (JSON)
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportData}
            accept=".json"
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {errorMessage && (
          <div
            className="mb-6 p-4 bg-red-100 border-red-400 text-red-700 rounded-md shadow-md dark:bg-red-900 dark:border-red-700 dark:text-red-300 print-hide"
            role="alert"
          >
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
