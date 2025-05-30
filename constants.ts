
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

export const RADAR_CHART_COLORS = {
  user: '#3b82f6', // blue-500
  marketAverage: '#84cc16', // lime-500 (example if we add market average later)
};