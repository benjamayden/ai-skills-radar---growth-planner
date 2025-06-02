
import { GeminiSafetySetting } from './types';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

export const APP_TITLE = "AI Skills Radar & Growth Planner";
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
