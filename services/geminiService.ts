
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import {
  UserInputData,
  ProcessedSkillsResponse,
  GrowthPlan,
  RubricLevel,
  IdentifiedSkillData,
  SkillCategory,
  GenAIService,
  LearningResource,
  Candidate,
} from '../types';
import { DEFAULT_SAFETY_SETTINGS } from '../constants';

function parseJsonFromText(text: string): any {
  let jsonStr = text.trim();
  // First, try to find ```json ... ```
  const fenceRegexJson = /^```json\s*\n?(.*?)\n?\s*```$/s;
  let match = jsonStr.match(fenceRegexJson);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  } else {
    // If not ```json ... ```, try to find ``` ... ``` (generic fence)
    const fenceRegexGeneric = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    match = jsonStr.match(fenceRegexGeneric);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
  }
  // If no fences were found, or if parsing fails, it will be caught by the try-catch
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response. Original text:", text, "Processed string for parsing:", jsonStr, "Error:", e);
    // Attempt to provide more specific feedback if it's a common issue
    if (jsonStr.includes("```")) {
        throw new Error("AI returned a response that looks like it contains JSON within code fences (```), but it could not be correctly extracted or parsed. Please check the console for the exact AI output.");
    }
    throw new Error(`AI returned an invalid JSON response. Parsing error: ${(e as Error).message}. Check the console for the raw AI output.`);
  }
}

const identifySkillsAndGenerateRubrics = async (
  genAI: GoogleGenAI,
  userInput: UserInputData
): Promise<ProcessedSkillsResponse> => {
  const prompt = `
You are an AI expert career analyst specializing in the product development and technology job market.
Your task is to identify key skills currently in demand and generate standard, market-relevant rubrics for them.

Use the following user input AS CONTEXT AND GUIDANCE for your analysis of the job market. This input helps to narrow down the areas of the job market and types of skills to focus on, but THE SKILLS AND RUBRIC DESCRIPTIONS THEMSELVES SHOULD BE BASED ON GENERAL MARKET EXPECTATIONS, NOT PERSONALIZED TO THE USER'S STATED CURRENT ABILITIES.
User Context:
- Hard Skills Listed by User (use as keywords or indicators of interest): ${userInput.hardSkills}
- User's Resume Information / Key Experience (provides context on the types of roles/domains they've been in or are interested in): ${userInput.resumeInfo}
- What Makes User Thrive (indicates preferred work styles or areas of passion, helping to theme the market search): ${userInput.aspirationsThrive}
- User's Career Goals (Next 5 Years) (helps identify relevant career trajectories and associated market skills): ${userInput.aspirationsGoals}

Based on your analysis of the CURRENT JOB MARKET for roles like Product Manager, UX/UI Designer, Software Developer, Data Analyst, Program Manager, Business Analyst, and considering the user's input above as a *lens* or *filter* for your market search:

1. Identify a list of approximately 15-20 key skills (a mix of hard and soft skills) that are in demand.
   Focus on skills relevant to the types of roles and domains indicated by the user's input. For example, if the user mentions "leading design teams" and "UX research", focus on market-relevant design leadership and research skills.

2. For each identified skill, provide:
    a. A unique 'id' (e.g., "python_programming", "user_research_methods"). Use lowercase and underscores.
    b. The 'name' of the skill (e.g., "Python Programming", "User Research Methods").
    c. A 'category', which must be either "Hard Skill" or "Soft Skill".
    d. A 'rubric' object with four string properties: "foundational", "intermediate", "advanced", and "expert".

IMPORTANT INSTRUCTIONS FOR RUBRIC DESCRIPTIONS:
For each rubric level ("foundational", "intermediate", "advanced", "expert"):
- The description MUST reflect what that competency level generally entails FOR THAT SKILL IN THE CURRENT PRODUCT/TECHNOLOGY JOB MARKET.
- These descriptions should be standard market definitions, not personalized to the specific user's current proficiency as described in their resume.
- Describe demonstrable abilities, responsibilities, or depth of knowledge typically expected at each level for roles that require this skill.
- Example for "foundational" for "User Research" (market definition): "Understands basic user research concepts and can assist in research activities like note-taking or participant screening under direct supervision. Familiar with common terminology."
- Example for "advanced" for "Agile Project Management" (market definition): "Independently leads complex agile projects, mentors teams in agile best practices, and can tailor methodologies to specific project and organizational needs. Demonstrates strategic thinking in applying agile frameworks to achieve business outcomes."
- Keep descriptions concise (1-2 sentences) and focused on objective, market-standard criteria.

Return the output as a single, valid JSON object.
The JSON object MUST have a top-level key "skills".
The value of "skills" MUST be an array of skill objects.
Each skill object in the array must conform to the structure specified (id, name, category, rubric).

CRITICALLY IMPORTANT for JSON validity:
- Ensure all strings are properly double-quoted.
- If the "skills" array contains multiple skill objects, EACH skill object (except for the very last one in the array) MUST be followed by a comma (","). For instance: \`[ {skill_object_1}, {skill_object_2}, {skill_object_3} ]\`. Missing these commas is a common cause of errors.
- Do not include any trailing commas after the last element in an array or the last property in an object.

Example of the complete expected JSON structure:
{
  "skills": [
    {
      "id": "cloud_computing_aws",
      "name": "Cloud Computing (AWS)",
      "category": "Hard Skill",
      "rubric": {
        "foundational": "Understands core AWS services (e.g., EC2, S3, IAM) and can perform basic operations via the console or CLI under guidance. Can explain fundamental cloud concepts.",
        "intermediate": "Can deploy and manage simple applications on AWS, select appropriate services for common use cases, and implement basic security and cost-management practices.",
        "advanced": "Designs and implements scalable, resilient, and secure cloud architectures on AWS. Optimizes applications for performance and cost. Proficient with Infrastructure as Code tools.",
        "expert": "Leads AWS strategy for an organization, architects complex multi-account environments, drives innovation using advanced AWS services, and is a recognized authority on AWS best practices."
      }
    }, // <<< Note this comma separating skill objects
    {
      "id": "stakeholder_management",
      "name": "Stakeholder Management",
      "category": "Soft Skill",
      "rubric": {
        "foundational": "Identifies key stakeholders and understands their basic interests. Can communicate information clearly to stakeholders with guidance.",
        "intermediate": "Proactively engages with stakeholders, manages expectations, and can effectively present information and gather feedback. Can resolve minor conflicts.",
        "advanced": "Develops and executes stakeholder engagement strategies for complex projects. Navigates conflicting interests, builds consensus, and influences senior stakeholders.",
        "expert": "Shapes and maintains long-term strategic relationships with critical stakeholders across an organization and externally. Expertly manages complex political landscapes and aligns diverse groups towards common goals."
      }
    } // <<< No comma if this is the last skill object in the array
    // ... more skill objects would continue, each (except the last) followed by a comma.
  ]
}

Focus on creating objective, market-standard rubrics. The user's input helps to direct your search within the job market, but the skill definitions and rubric criteria themselves should be general.
Do not include any text or comments outside the main JSON object. The entire response must be parsable as JSON.
`;

  try {
    const response: GenerateContentResponse = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        safetySettings: DEFAULT_SAFETY_SETTINGS,
        temperature: 0.4, 
      },
    });
    
    const parsedData = parseJsonFromText(response.text);

    if (!parsedData.skills || !Array.isArray(parsedData.skills)) {
      console.error("AI response is missing 'skills' array or it's not an array. Parsed data:", parsedData);
      throw new Error("AI response is missing 'skills' array or it's not a valid array. Check AI output format.");
    }

    const validatedSkills: IdentifiedSkillData[] = parsedData.skills.map((s: any, index: number) => {
      if (!s.id || typeof s.id !== 'string' || s.id.trim() === '') {
        console.warn(`Skipping skill at index ${index} due to missing or invalid 'id':`, s); return null;
      }
      if (!s.name || typeof s.name !== 'string' || s.name.trim() === '') {
        console.warn(`Skipping skill '${s.id}' due to missing or invalid 'name':`, s); return null;
      }
      if (!s.category || (s.category !== SkillCategory.HARD && s.category !== SkillCategory.SOFT)) {
        console.warn(`Skipping skill '${s.id}' due to missing or invalid 'category':`, s); return null;
      }
      if (!s.rubric || typeof s.rubric !== 'object' ||
          typeof s.rubric.foundational !== 'string' || s.rubric.foundational.trim() === '' ||
          typeof s.rubric.intermediate !== 'string' || s.rubric.intermediate.trim() === '' ||
          typeof s.rubric.advanced !== 'string' || s.rubric.advanced.trim() === '' ||
          typeof s.rubric.expert !== 'string' || s.rubric.expert.trim() === '') {
        console.warn(`Skipping skill '${s.id}' due to incomplete or invalid 'rubric' descriptions:`, s.rubric); return null;
      }
      return {
        id: String(s.id).trim(),
        name: String(s.name).trim(),
        category: s.category as SkillCategory,
        rubric: {
          skillId: String(s.id).trim(), 
          foundational: String(s.rubric.foundational).trim(),
          intermediate: String(s.rubric.intermediate).trim(),
          advanced: String(s.rubric.advanced).trim(),
          expert: String(s.rubric.expert).trim(),
        }
      };
    }).filter((s: IdentifiedSkillData | null): s is IdentifiedSkillData => s !== null);


    if (validatedSkills.length === 0 && parsedData.skills.length > 0) {
      throw new Error("AI returned skills, but none passed validation. This might indicate a systematic issue with the AI's output format. Please check the console for details on skipped skills.");
    }
     if (validatedSkills.length === 0 && parsedData.skills.length === 0) {
      // This case is fine, means AI genuinely found no skills or user input was sparse.
      // No error, just return empty array.
    }
    
    return { skills: validatedSkills };

  } catch (error) {
    console.error("Error in identifySkillsAndGenerateRubrics:", error);
    // Re-throw the error so it can be caught by the UI and displayed
    // If it's a custom error from parseJsonFromText, it will be more descriptive.
    throw error; 
  }
};


const generateGrowthPlan = async (
  genAI: GoogleGenAI,
  skillName: string,
  userCompetencyLevel: RubricLevel,
  aspirationsGoals: string // Added aspirationsGoals for context
): Promise<GrowthPlan> => {
  const prompt = `
The user has selected "${skillName}" as a focus skill for their professional growth.
Their current self-assessed competency in this skill is "${userCompetencyLevel}".
Their stated 5-year career goals are: "${aspirationsGoals}".

Task:
Please provide a structured growth plan. Use the following section headers EXACTLY as written, followed by your content for that section:

### YOUR CURRENT STANDING ###
(Analyze the user's current self-assessed competency level ("${userCompetencyLevel}") for the skill "${skillName}". Describe what this level typically means in the current job market – e.g., responsibilities, expectations, type of tasks they might handle. Keep this concise, 2-3 sentences.)

### DEVELOPING TOWARDS YOUR GOALS ###
(Considering the user's 5-year career goals ("${aspirationsGoals}"), describe what a higher level of proficiency in "${skillName}" (e.g., Advanced or Expert, or the next step up from their current level if already high) would entail. How does enhanced skill in "${skillName}" align with their aspirations? What kind of impact or roles could they aim for with improved competency? Keep this concise, 2-3 sentences.)

### LEARNING RESOURCES ###
(Provide a list of 3-5 curated learning resources to help the user improve their "${skillName}" skill. For each resource, present it strictly in the following format on separate lines:
Resource Title: [Title of resource]
Resource URL: [Direct URL, ensure it's a full valid URL starting with http:// or https://]
Resource Type: [e.g., Article, Online Course, Community, Tool, Book, Video, Documentation, Workshop, Certification]
--- (separator between resources)
Focus on high-quality, reputable resources.)

Use Google Search to gather current information for all sections. Ensure the information is up-to-date and relevant.
Structure your entire response clearly under these specific headers.
`;

  try {
    const response: GenerateContentResponse = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        safetySettings: DEFAULT_SAFETY_SETTINGS,
        temperature: 0.6,
      },
    });

    const textResponse = response.text;
    
    const learningResources: LearningResource[] = [];
    const resourceRegex = /Resource Title: ([\s\S]*?)\nResource URL: (https?:\/\/[^\s]+)\nResource Type: ([\s\S]*?)(?:\n---|$)/gs;
    let match;
    while ((match = resourceRegex.exec(textResponse)) !== null) {
      const title = match[1].trim();
      const url = match[2].trim();
      const type = match[3].trim();
      if (title && url && type) {
         learningResources.push({ title, url, type });
      }
    }

    let currentProficiencyContext = "Detailed analysis for your current standing could not be generated.";
    let targetProficiencyContext = "Detailed analysis for developing towards your goals could not be generated.";

    const currentStandingMatch = textResponse.match(/### YOUR CURRENT STANDING ###\s*([\s\S]*?)(?=\n### DEVELOPING TOWARDS YOUR GOALS ###|$)/);
    if (currentStandingMatch && currentStandingMatch[1]) {
      currentProficiencyContext = currentStandingMatch[1].trim();
    }

    const targetGoalsMatch = textResponse.match(/### DEVELOPING TOWARDS YOUR GOALS ###\s*([\s\S]*?)(?=\n### LEARNING RESOURCES ###|$)/);
    if (targetGoalsMatch && targetGoalsMatch[1]) {
      targetProficiencyContext = targetGoalsMatch[1].trim();
    }
    
    const candidate = response.candidates?.[0] as Candidate | undefined;

    return {
      skillName,
      currentProficiencyContext,
      targetProficiencyContext,
      learningResources,
      searchAttributions: candidate?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error(`Error generating growth plan for ${skillName}:`, error);
    throw new Error(`Failed to generate growth plan for "${skillName}". ${(error as Error).message}`);
  }
};


const suggestJobTitles = async (
  genAI: GoogleGenAI,
  skillsWithRatings: { skillName: string; rating: RubricLevel }[]
): Promise<string[]> => {
  if (skillsWithRatings.length === 0) {
    return []; // No skills to base suggestions on
  }
  const skillsProfileString = skillsWithRatings
    .map(sr => `- ${sr.skillName} (Proficiency: ${sr.rating})`)
    .join("\n");

  const prompt = `
You are an AI expert career advisor. Based on the user's following skill profile, which includes their self-assessed competency levels (Foundational, Intermediate, Advanced, Expert), suggest a list of 5-7 potential job titles that align well with their current capabilities and the skills they possess.

User Skills Profile:
${skillsProfileString}

Consider roles primarily in product management, UX/UI design, software development, data analysis, program management, and business analysis. Tailor suggestions to the strengths indicated by their higher-rated skills.
The job titles should be realistic for the given proficiency levels. For example, if most skills are 'Foundational' or 'Intermediate', suggest entry to mid-level roles. If 'Advanced' or 'Expert' skills are prominent, suggest more senior or specialized roles.

Return the output as a single JSON object with a key "jobTitles", where "jobTitles" is an array of strings.
Example:
{
  "jobTitles": ["Associate Product Manager", "UX Designer (Mid-Level)", "Data Analyst I", "Junior Software Developer"]
}
Ensure the entire response is a valid JSON object and contains only the list of job titles.
`;

  try {
    const response: GenerateContentResponse = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        safetySettings: DEFAULT_SAFETY_SETTINGS,
        temperature: 0.5, // Slightly lower temperature for more focused job title suggestions
      },
    });
    
    const parsedData = parseJsonFromText(response.text);

    if (!parsedData.jobTitles || !Array.isArray(parsedData.jobTitles)) {
      throw new Error("AI response is missing 'jobTitles' array or it's not a valid array. Check AI output format.");
    }
    return parsedData.jobTitles.map(String).filter((title: string) => title.trim() !== "");
  } catch (error) {
    console.error("Error in suggestJobTitles:", error);
    throw new Error(`Failed to suggest job titles. ${(error as Error).message}`);
  }
};

export const geminiService: GenAIService = {
  identifySkillsAndGenerateRubrics,
  generateGrowthPlan,
  suggestJobTitles,
};
