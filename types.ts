
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

export interface UserInputData {
  hardSkills: string;
  resumeInfo: string;
  aspirationsThrive: string;
  aspirationsGoals: string;
}

export enum SkillCategory {
  HARD = "Hard Skill",
  SOFT = "Soft Skill",
}

export interface Skill {
  id: string; // unique identifier for the skill, e.g., "python_programming"
  name: string;
  category: SkillCategory;
}

export enum RubricLevel {
  FOUNDATIONAL = "Foundational",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  EXPERT = "Expert",
}

export const RUBRIC_LEVELS_ORDERED: RubricLevel[] = [
  RubricLevel.FOUNDATIONAL,
  RubricLevel.INTERMEDIATE,
  RubricLevel.ADVANCED,
  RubricLevel.EXPERT,
];

export const RUBRIC_LEVEL_MAP: Record<RubricLevel, number> = {
  [RubricLevel.FOUNDATIONAL]: 1,
  [RubricLevel.INTERMEDIATE]: 2,
  [RubricLevel.ADVANCED]: 3,
  [RubricLevel.EXPERT]: 4,
};

export const MAX_RUBRIC_LEVEL_VALUE = 4;

export interface RubricCriterion {
  level: RubricLevel;
  description: string;
}

export interface Rubric {
  skillId: string;
  foundational: string;
  intermediate: string;
  advanced: string;
  expert: string;
}

export interface IdentifiedSkillData extends Skill {
  rubric: Rubric;
}

export interface ProcessedSkillsResponse {
  skills: IdentifiedSkillData[];
  searchAttributions?: GroundingChunk[]; // Optional search attributions from skill identification
}

export interface LearningResource {
  title: string;
  url: string;
  type: string;
}

export interface GrowthPlan {
  skillName: string;
  currentProficiencyContext: string; // Details current level and market reaction
  targetProficiencyContext: string; // Details 5-year plan alignment and market expectations at target level
  learningResources: LearningResource[];
  searchAttributions?: GroundingChunk[];
}

export interface WebSource {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: WebSource;
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}
export interface Candidate {
  groundingMetadata?: GroundingMetadata;
  // Assuming candidates structure for safety ratings and other content parts if needed.
  // For simplicity, only groundingMetadata is shown here as it's directly used.
}


export interface GeminiSafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

export interface SuggestedJobsResponse {
  titles: string[];
  searchAttributions?: GroundingChunk[];
}

export interface GenAIService {
  identifySkillsAndGenerateRubrics: (genAI: GoogleGenAI, userInput: UserInputData) => Promise<ProcessedSkillsResponse>;
  generateGrowthPlan: (
    genAI: GoogleGenAI,
    skillName: string,
    userCompetencyLevel: RubricLevel,
    aspirationsGoals: string,
    suggestedJobTitles: string[] // Added suggestedJobTitles
  ) => Promise<GrowthPlan>;
  suggestJobTitles: (genAI: GoogleGenAI, skillsWithRatings: { skillName: string; rating: RubricLevel }[]) => Promise<SuggestedJobsResponse>;
}

// Updated AppStep
export enum AppStep {
  API_KEY_INPUT,
  USER_DATA_INPUT, // For initial data entry
  PROCESSING,      // Generic processing state
  MAIN_VIEW,       // Main view with tabs
}

// New type for active tab
export type ActiveTabType = 'details' | 'radar' | 'growth' | 'radarAndRubrics';


// New types for multi-rater feedback
export interface Rater {
  id: string; // unique id for the rater, e.g., "self", "manager_jane", "peer_john"
  name: string; // display name, e.g., "Self-Assessment", "Manager (Jane D.)", "Peer (John S.)"
  isSelf: boolean; // true if this is the user's own rating
}

export const SELF_ASSESSMENT_RATER_ID = 'self';


export interface SkillRatingEntry {
  id: string;
  raterId: string;
  rating: RubricLevel;
}

// Type for the userRatings state: skillId maps to an array of ratings from different raters
export type UserRatingsData = Record<string, SkillRatingEntry[]>;


// Type for Application's full data state for export/import
export interface AppExportData {
  userInput: UserInputData | null;
  identifiedSkills: IdentifiedSkillData[];
  raters: Rater[];
  userRatings: UserRatingsData;
  focusSkills: string[]; // skill IDs
  growthPlans: GrowthPlan[];
  suggestedJobTitles: string[];
  activeTab?: ActiveTabType; // Save active tab
  activeRaterId?: string; // Save active rater ID
  comparisonRaterIds?: string[]; // Save comparison rater IDs
  showAverageOnRadar?: boolean; // Save show average preference
  appVersion?: string;
  // We don't export attributions as they are tied to a specific API call instance
}

export enum RadarViewMode {
  INDIVIDUAL = "Individual", // Represents viewing a single rater, though not explicitly used as a state.
  COMPARISON = "Comparison"  // Represents viewing multiple raters.
}

// Data structure for passing processed rater data to the SkillsRadarChart
export interface RadarDisplaySeries {
  key: string; // Unique key for Recharts (e.g., "rater_self", "rater_peer123", "average")
  name: string; // Display name for legend (e.g., "Self-Assessed", "Peer (John)", "Average")
  color: string; // Hex color code
  isAverage?: boolean; // Flag for styling average line differently if needed
}
