import { GeminiSafetySetting, SkillCategory } from './types';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

export const APP_TITLE = "Skilldar.ai";
export const MAX_FOCUS_SKILLS = 3;

export const DEFAULT_SAFETY_SETTINGS: GeminiSafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const SELF_ASSESSMENT_COLOR = '#3b82f6'; // blue-500 for the user's self-assessment

export const RADAR_SERIES_COLORS = [ // Colors for other raters in comparison view
  '#ef4444', // red-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
];

export const RADAR_AVERAGE_COLOR = '#475569'; // slate-600 for the average line

export const CYCLING_LOADING_MESSAGES: Array<{ text: string; duration: number }> = [
  { text: "Generating...", duration: 5000 },
  { text: "Please wait...", duration: 10000 },
  { text: "Analysing results...", duration: 5000 },
  { text: "Please wait...", duration: 10000 },
  { text: "Compiling information...", duration: 5000 },
  { text: "Please wait...", duration: 10000 },
  { text: "Finishing up...", duration: 5000 },
  { text: "Please wait...", duration: 10000 },
];

// Universal Growth Enablers - Core soft skills automatically included for every user
export const UNIVERSAL_GROWTH_ENABLERS = [
  {
    id: "communication",
    name: "Communication",
    description: "Ability to convey ideas clearly and listen effectively across various formats and audiences",
    category: SkillCategory.SOFT,
    isUniversalEnabler: true,
    rubric: {
      skillId: "communication",
      foundational: "Can convey basic information clearly and listen to others. Asks clarifying questions when needed and participates in team discussions.",
      intermediate: "Communicates effectively across different formats (written, verbal, visual). Adapts communication style to audience and facilitates basic meetings.",
      advanced: "Leads complex discussions, presents to senior stakeholders, and resolves communication breakdowns. Creates compelling narratives and influences decision-making.",
      expert: "Sets communication standards for the organization. Coaches others in communication skills and handles high-stakes, sensitive, or crisis communications with exceptional skill."
    }
  },
  {
    id: "collaboration",
    name: "Collaboration",
    description: "Working effectively with others to achieve common goals and build productive relationships",
    category: SkillCategory.SOFT,
    isUniversalEnabler: true,
    rubric: {
      skillId: "collaboration",
      foundational: "Works well with immediate team members. Shares information and supports team goals. Accepts feedback and incorporates it constructively.",
      intermediate: "Collaborates effectively across teams and departments. Builds productive working relationships and contributes to team decision-making processes.",
      advanced: "Leads cross-functional initiatives and builds consensus among diverse stakeholders. Resolves conflicts and creates collaborative frameworks for complex projects.",
      expert: "Shapes collaborative culture across the organization. Designs and implements collaboration strategies that break down silos and drive organizational effectiveness."
    }
  },
  {
    id: "problem_solving",
    name: "Problem Solving",
    description: "Systematic approach to identifying, analyzing, and resolving challenges efficiently",
    category: SkillCategory.SOFT,
    isUniversalEnabler: true,
    rubric: {
      skillId: "problem_solving",
      foundational: "Identifies obvious problems and follows established procedures to resolve them. Asks for help when stuck and learns from solutions.",
      intermediate: "Analyzes problems systematically and generates multiple solutions. Uses frameworks and tools to break down complex issues into manageable parts.",
      advanced: "Solves ambiguous, multi-faceted problems with limited guidance. Creates new approaches and frameworks. Anticipates problems before they occur.",
      expert: "Tackles the most complex organizational challenges. Develops innovative problem-solving methodologies and teaches others advanced problem-solving techniques."
    }
  },
  {
    id: "adaptability",
    name: "Adaptability", 
    description: "Flexibility and resilience in responding to change and uncertainty",
    category: SkillCategory.SOFT,
    isUniversalEnabler: true,
    rubric: {
      skillId: "adaptability",
      foundational: "Accepts changes when communicated clearly and adjusts work accordingly. Maintains performance during routine changes.",
      intermediate: "Embraces change and helps others navigate transitions. Quickly learns new tools, processes, and adjusts strategies based on feedback.",
      advanced: "Thrives in ambiguous environments and leads change initiatives. Anticipates future trends and prepares the team for upcoming shifts.",
      expert: "Drives transformation across the organization. Creates adaptive strategies and builds organizational resilience for sustained success in volatile environments."
    }
  },
  {
    id: "continuous_learning",
    name: "Continuous Learning",
    description: "Commitment to ongoing skill development and knowledge acquisition",
    category: SkillCategory.SOFT,
    isUniversalEnabler: true,
    rubric: {
      skillId: "continuous_learning",
      foundational: "Shows curiosity about work and seeks learning opportunities. Completes required training and applies new knowledge to daily tasks.",
      intermediate: "Proactively identifies skill gaps and pursues relevant learning. Shares knowledge with team and applies current with industry trends.",
      advanced: "Creates personal learning strategies aligned with career goals. Mentors others and contributes to organizational learning initiatives.",
      expert: "Shapes learning culture and strategy for the organization. Identifies emerging competencies needed for future success and builds comprehensive development programs."
    }
  },
  {
    id: "leadership",
    name: "Leadership",
    description: "Ability to guide, influence, and inspire others toward achieving goals",
    category: SkillCategory.SOFT,
    isUniversalEnabler: true,
    rubric: {
      skillId: "leadership",
      foundational: "Takes ownership of assigned tasks and demonstrates reliability. Shows initiative in identifying improvements and volunteers for additional responsibilities.",
      intermediate: "Leads small projects and influences peers. Provides guidance to junior team members and takes accountability for team outcomes.",
      advanced: "Leads teams and major initiatives successfully. Develops others, sets strategic direction, and drives organizational change.",
      expert: "Provides executive leadership across the organization. Shapes culture, vision, and strategy while developing the next generation of leaders."
    }
  }
];

// Skill Selection Configuration
export const SKILL_SELECTION_CONFIG = {
  AI_CANDIDATES_TO_GENERATE: 12, // Number of AI-generated skill candidates
  MAX_PERSONAL_SKILLS: 6, // Maximum personal skills user can select
  UNIVERSAL_ENABLERS_COUNT: 6, // Always include 6 universal enablers
  RANKING_WEIGHTS: {
    GOAL_RELEVANCE: 0.4,
    STRATEGY_ALIGNMENT: 0.3,
    MARKET_IMPORTANCE: 0.3
  }
};

// ===============================================
// DEVELOPMENT CYCLE CONFIGURATION
// ===============================================

// Development Cycle Configuration - SIMPLIFIED: One goal per cycle for better focus
export const DEVELOPMENT_CYCLE_CONFIG = {
  DEFAULT_CYCLE_DURATION_MONTHS: 3,     // Quarterly cycles by default
  MAX_GOALS_PER_CYCLE: 1,               // SIMPLIFIED: Only one goal per cycle for maximum focus
  MIN_GOALS_PER_CYCLE: 1,               // Exactly one goal required
  MAX_ACTIONS_PER_GOAL: 5,              // SIMPLIFIED: Reduced action complexity
  CYCLE_TEMPLATES: [
    { name: "Quarterly", months: 3 },
    { name: "Half-Yearly", months: 6 },
    { name: "Annual", months: 12 },
    { name: "Custom", months: 0 }
  ]
};

// Growth Dimension Descriptions for UI
export const GROWTH_DIMENSION_DESCRIPTIONS = {
  Breadth: {
    title: "Breadth - Versatility",
    description: "Enhancing versatility and cross-functional contribution",
    icon: "🌐",
    examples: ["Cross-team collaboration", "Multi-domain knowledge", "Adaptability"]
  },
  Depth: {
    title: "Depth - Expertise", 
    description: "Deepening specialization and expertise in critical areas",
    icon: "⚡",
    examples: ["Technical mastery", "Domain expertise", "Thought leadership"]
  },
  Reach: {
    title: "Reach - Influence",
    description: "Expanding involvement, responsibility, and ability to shape work",
    icon: "🎯",
    examples: ["Leadership roles", "Initiative ownership", "Strategic input"]
  },
  Range: {
    title: "Range - Complexity",
    description: "Tackling more complex, high-impact, or strategic work",
    icon: "🚀",
    examples: ["Complex projects", "High-stakes decisions", "Organizational impact"]
  }
};

// Company Values Descriptions
export const COMPANY_VALUES_DESCRIPTIONS = {
  "Forward-thinking": {
    description: "Creating a better tomorrow through thoughtful planning and innovation",
    behaviors: ["Strategic thinking", "Innovation", "Future planning"]
  },
  "Contribution": {
    description: "Believing that everyone can make a valuable difference and share ideas",
    behaviors: ["Active participation", "Idea sharing", "Value creation"]
  },
  "Collaboration": {
    description: "Recognizing that working together produces the best outcomes",
    behaviors: ["Teamwork", "Knowledge sharing", "Collective success"]
  },
  "Transparency": {
    description: "Seeking insight and sharing knowledge to foster engagement and innovation",
    behaviors: ["Open communication", "Knowledge sharing", "Honest feedback"]
  }
};

// Goal Type Configuration
export const GOAL_TYPE_CONFIG = {
  "Skill Development": {
    icon: "📚",
    description: "Building technical or soft skills",
    commonMetrics: ["Certification completion", "Skill assessment improvement", "Practical application"]
  },
  "Project Contribution": {
    icon: "🏗️", 
    description: "Contributing to specific projects or initiatives",
    commonMetrics: ["Project completion", "Deliverable quality", "Stakeholder feedback"]
  },
  "Leadership Growth": {
    icon: "👥",
    description: "Developing leadership and management capabilities",
    commonMetrics: ["Team feedback", "Leadership assessment", "Mentoring success"]
  },
  "Process Improvement": {
    icon: "⚙️",
    description: "Enhancing workflows, efficiency, or quality",
    commonMetrics: ["Process metrics", "Efficiency gains", "Quality improvements"]
  },
  "Innovation": {
    icon: "💡",
    description: "Creating new solutions or improving existing ones",
    commonMetrics: ["Innovation impact", "Adoption rates", "Creative solutions"]
  },
  "Mentoring": {
    icon: "🤝",
    description: "Supporting and developing others",
    commonMetrics: ["Mentee progress", "Feedback quality", "Development outcomes"]
  }
};

// Feedback Templates for common scenarios
export const FEEDBACK_TEMPLATES = {
  PROJECT_FEEDBACK: {
    title: "Project Contribution Feedback",
    prompts: [
      "What were [Name]'s key contributions to this project?",
      "How did they handle challenges or obstacles?",
      "What could they improve for future projects?"
    ]
  },
  SKILL_FEEDBACK: {
    title: "Skill Development Feedback", 
    prompts: [
      "How has [Name] demonstrated growth in [Skill]?",
      "What examples show their current capability level?",
      "What would help them advance to the next level?"
    ]
  },
  GENERAL_FEEDBACK: {
    title: "General Development Feedback",
    prompts: [
      "What are [Name]'s greatest strengths?",
      "What areas would benefit from development?",
      "What specific examples support your observations?"
    ]
  }
};
