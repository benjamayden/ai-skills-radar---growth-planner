import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

export interface UserInputData {
  hardSkills: string;
  resumeInfo: string;
  aspirationsThrive: string;
  aspirationsGoals: string;
  teamStrategy: string; // Now required
  companyStrategy: string; // Now required
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

export interface IdentifiedSkillData extends Skill {
  description: any;
  rubric: Rubric;
  isUniversalEnabler?: boolean; // Flag to identify Universal Growth Enablers
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

export interface ProcessedSkillsResponse {
  skills: IdentifiedSkillData[];
  searchAttributions?: GroundingChunk[]; // Optional search attributions from skill identification
}

export interface LearningResource {
  title: string;
  url: string;
  type: string;
}

export interface GrowthDimensionAnalysis {
  breadth: string; // How this skill enhances versatility and cross-functional contribution
  depth: string;   // How this skill deepens specialization and expertise
  reach: string;   // How this skill expands involvement, responsibility, and ability to shape work
  range: string;   // How this skill enables tackling more complex, high-impact, or strategic work
}

export interface GrowthPlan {
  skillName: string;
  currentProficiencyContext: string; // Details current level and market reaction
  targetProficiencyContext: string; // Details 5-year plan alignment and market expectations at target level
  learningResources: LearningResource[];
  dimensionAnalysis: GrowthDimensionAnalysis; // NEW: Strategic growth dimension analysis
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
  generateSkillCandidates: (genAI: GoogleGenAI, userInput: UserInputData) => Promise<SkillGenerationResponse>; // NEW
}

// Updated AppStep
export enum AppStep {
  API_KEY_INPUT = "api-key-input",
  USER_DATA_INPUT = "user-data-input", 
  SKILL_SELECTION = "skill-selection", // NEW
  PROCESSING = "processing",
  MAIN_VIEW = "main-view"
}

// New type for active tab
export type ActiveTabType = 'details' | 'radar' | 'growth' | 'radarAndRubrics' | 'development';


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
  version: string;
  exportDate: string;
  userInput: UserInputData | null;
  skillSelection?: SkillSelectionState;
  identifiedSkills: IdentifiedSkillData[];
  userRatings: UserRatingsData;
  focusSkills: string[];
  growthPlans: GrowthPlan[];
  suggestedJobTitles: string[]; // Fix: Change from suggestedJobs to suggestedJobTitles
  raters: Rater[];
  theme: "light" | "dark";
  activeTab?: ActiveTabType;
  activeRaterId?: string;
  comparisonRaterIds?: string[];
  showAverageOnRadar?: boolean;
}

// NEW: Enhanced skill candidate for selection process
export interface SkillCandidate {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  
  // Selection metadata
  relevanceScore: number; // 1-10 overall relevance
  goalAlignment: string; // How it supports user's goals
  strategyAlignment: string; // How it supports company/team strategy
  marketImportance: string; // Why it's valuable in current market
  
  // Ranking factors (lower number = higher rank)
  goalRelevanceRank: number;
  strategyRelevanceRank: number;
  marketImportanceRank: number;
  overallRank: number;
  
  rubric: Rubric;
  isUniversalEnabler?: boolean;
}

// NEW: Skill selection state
export interface SkillSelectionState {
  candidates: SkillCandidate[];
  selectedPersonalSkills: string[]; // IDs of selected personal skills
  universalEnablers: SkillCandidate[]; // Always included (6 skills)
  maxPersonalSkills: number; // Default: 6
}

// NEW: Response from AI skill generation
export interface SkillGenerationResponse {
  skillCandidates: SkillCandidate[];
  summary: string;
  recommendedFocus: string[]; // Top 6 AI-recommended skill IDs
  totalGenerated: number;
}

// NEW: Add RadarDisplaySeries interface
export interface RadarDisplaySeries {
  key: string;
  name: string;
  color: string;
  isAverage?: boolean;
}

// NEW: Skill visibility and mastery tracking
export enum SkillStatus {
  ACTIVE = "active",           // Currently visible in radar/lists
  MASTERED = "mastered",       // Hidden due to high proficiency, can be toggled back
  ARCHIVED = "archived"        // Completely archived, not available for selection
}

export interface SkillMasteryCheck {
  skillId: string;
  canBeMastered: boolean;      // True if meets criteria (self + 3 others at Advanced/Expert)
  ratingsSummary: {
    selfRating?: RubricLevel;
    otherRatings: { raterId: string; raterName: string; rating: RubricLevel }[];
    totalHighRatings: number;  // Count of Advanced/Expert ratings
  };
}

export interface SkillBank {
  activeSkills: string[];      // Currently visible skill IDs (max 12)
  masteredSkills: string[];    // Skills marked as mastered (hidden by default)
  allSkillsData: IdentifiedSkillData[]; // Complete skill data for all skills
}

// Enhanced AppExportData to include skill banking
export interface AppExportDataV2 extends Omit<AppExportData, 'identifiedSkills'> {
  skillBank: SkillBank;        // Replaces the simple identifiedSkills array
  skillStatuses: Record<string, SkillStatus>; // Track status of each skill
}

// ===============================================
// DEVELOPMENT CYCLE MANAGEMENT TYPES
// ===============================================

// Skill Level enum for development cycle skill tracking
export enum SkillLevel {
  LEARNING = "Learning",     // Just starting to learn this skill
  PRACTICING = "Practicing", // Actively practicing and building proficiency
  APPLYING = "Applying",     // Can apply the skill effectively in work
  LEADING = "Leading"        // Can lead others and teach this skill
}

// Core Growth Dimensions from Mayden Framework
export enum GrowthDimension {
  BREADTH = "Breadth", // Versatility and cross-functional contribution
  DEPTH = "Depth",     // Specialization and deep expertise
  REACH = "Reach",     // Involvement, responsibility, and ability to shape work
  RANGE = "Range"      // Complexity, risk, and business importance of work
}

// Company Values for goal alignment
export enum CompanyValue {
  FORWARD_THINKING = "Forward-thinking",
  CONTRIBUTION = "Contribution", 
  COLLABORATION = "Collaboration",
  TRANSPARENCY = "Transparency"
}

// Goal Types for categorization
export enum GoalType {
  SKILL_DEVELOPMENT = "Skill Development",
  PROJECT_CONTRIBUTION = "Project Contribution", 
  LEADERSHIP_GROWTH = "Leadership Growth",
  PROCESS_IMPROVEMENT = "Process Improvement",
  INNOVATION = "Innovation",
  MENTORING = "Mentoring"
}

// Goal Status tracking
export enum GoalStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress", 
  COMPLETED = "Completed",
  ON_HOLD = "On Hold",
  CANCELLED = "Cancelled"
}

// Action Status for goal breakdown
export enum ActionStatus {
  TO_DO = "To Do",
  IN_PROGRESS = "In Progress",
  DONE = "Done"
}

// Development Goal interface
export interface DevelopmentGoal {
  id: string;
  title: string;
  description: string;
  goalType: GoalType;
  growthDimensions: GrowthDimension[]; // Required: at least one dimension
  companyValues?: CompanyValue[];      // Optional: alignment to company values
  successMetrics: string;
  targetCompletionDate: string;       // ISO date string
  status: GoalStatus;
  createdDate: string;               // ISO date string
  lastUpdated: string;               // ISO date string
  relatedSkillIds?: string[];        // Link to skills being developed
  actions: DevelopmentAction[];      // Breakdown into actionable steps
  progress: number;                  // 0-100 percentage
  reflection?: string;               // User notes and learnings
}

// Development Action interface
export interface DevelopmentAction {
  id: string;
  title: string;
  description: string;
  goalId: string;                    // Parent goal reference
  status: ActionStatus;
  dueDate?: string;                  // ISO date string
  completedDate?: string;            // ISO date string when marked done
  resourceLinks: ResourceLink[];     // Learning materials, documentation
  notes?: string;                    // Progress notes
  estimatedHours?: number;           // Time investment estimate
  actualHours?: number;              // Time actually spent
}

// Resource Link for actions
export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  description?: string;
}

export enum ResourceType {
  TRAINING_COURSE = "Training Course",
  DOCUMENTATION = "Documentation", 
  PROJECT_BOARD = "Project Board",
  MENTORSHIP = "Mentorship",
  BOOK = "Book",
  ARTICLE = "Article",
  VIDEO = "Video",
  CERTIFICATION = "Certification",
  CONFERENCE = "Conference",
  OTHER = "Other"
}

// Development Cycle interface
export interface DevelopmentCycle {
  id: string;
  title: string;                     // e.g., "Q3 2025 Development Cycle"
  description?: string;
  startDate: string;                 // ISO date string
  endDate: string;                   // ISO date string
  status: CycleStatus;
  goals: string[];                   // Array of goal IDs
  feedbackSummary?: string;          // Personal retro summary
  reflectionSummary?: string;        // Overall cycle reflection
  createdDate: string;               // ISO date string
  closedDate?: string;               // ISO date string when cycle completed
}

export enum CycleStatus {
  PLANNING = "Planning",
  ACTIVE = "Active", 
  REVIEW = "Review",
  COMPLETED = "Completed"
}

// Feedback Entry for Personal Retro
export interface FeedbackEntry {
  id: string;
  cycleId: string;
  providerId: string;                // Can be self or peer rater ID
  providerName: string;
  feedbackType: FeedbackType;
  content: string;
  strengths?: string;
  areasForGrowth?: string;
  examples?: string;                 // Specific evidence/examples
  dateProvided: string;              // ISO date string
  isPrivate: boolean;               // Whether visible only to recipient
  goalId?: string;                  // Optional: link to specific goal
  skillId?: string;                 // Optional: link to specific skill
}

export enum FeedbackType {
  GENERAL = "General",
  GOAL_SPECIFIC = "Goal Specific",
  SKILL_SPECIFIC = "Skill Specific", 
  PROJECT_SPECIFIC = "Project Specific",
  SELF_REFLECTION = "Self Reflection"
}

// Enhanced AppExportData to include development cycles
export interface AppExportDataV3 extends AppExportDataV2 {
  developmentCycles: DevelopmentCycle[];
  developmentGoals: DevelopmentGoal[];
  developmentActions: DevelopmentAction[];
  feedbackEntries: FeedbackEntry[];
  activeCycleId?: string;            // Current active cycle
}
