import { callGroq } from './groqService';

export interface PromptGenerationInput {
  projectName: string;
  description: string;
  platform: 'website' | 'mobile' | 'fullstack' | 'saas' | 'ai' | 'ecommerce' | 'dashboard' | 'custom';
  targetUsers?: string;
  features?: string[];
  technology?: string;
  designStyle?: string;
  authentication?: string;
  database?: string;
  aiRequirements?: string;
  payment?: string;
  adminPanel?: boolean;
  extraRequirements?: string;
  interviewAnswers?: Record<string, string>;
}

export interface GeneratedPrompts {
  analysis: any;
  websitePrompt: string;
  mobilePrompt: string;
  backendPrompt: string;
  databasePrompt: string;
  apiPrompt: string;
  deploymentPrompt: string;
  masterPrompt: string;
}

const SYSTEM_PROMPT = `
You are a senior full-stack architect, UI/UX designer, AI engineer, backend engineer, database architect, mobile engineer, DevOps engineer, security engineer, and QA engineer.

Your task is to analyze a user's application idea and generate a complete, implementation-ready development blueprint.

You must respond in **valid JSON only** with the following structure:
{
  "analysis": {
    "productName": "string",
    "category": "string",
    "targetAudience": "string",
    "problemSolved": "string",
    "coreValue": "string",
    "userJourneys": ["string"],
    "userRoles": ["string"],
    "coreFeatures": ["string"],
    "advancedFeatures": ["string"],
    "techStack": {
      "frontend": "string",
      "backend": "string",
      "database": "string",
      "ai": "string",
      "deployment": "string"
    },
    "integrations": ["string"],
    "scalabilityConsiderations": ["string"],
    "securityConsiderations": ["string"],
    "assumptions": ["string"]
  },
  "websitePrompt": "A complete master prompt for building the web version of the application. Include architecture, pages, UI/UX, components, state management, routing, API integration, authentication, admin panel, etc. Start with 'You are a senior full-stack engineer...'",
  "mobilePrompt": "A complete master prompt for building the mobile app. Choose React Native/Expo, Flutter, or native. Include architecture, navigation, screens, components, API integration, permissions, push notifications, offline behavior, etc. Start with 'You are a senior mobile developer...'",
  "backendPrompt": "A complete master prompt for building the backend. Include framework, REST/GraphQL API, controllers, services, middleware, authentication, database models, validation, security, deployment. Start with 'You are a senior backend engineer...'",
  "databasePrompt": "A detailed database design prompt. Choose PostgreSQL, MongoDB, or Firebase based on the app. Include tables/collections, fields, types, keys, relationships, indexes. Start with 'You are a database architect...'",
  "apiPrompt": "A complete API specification prompt. List all required endpoints with methods, URLs, auth, request/response bodies. Start with 'You are an API architect...'",
  "deploymentPrompt": "A deployment architecture prompt. Include frontend deployment, backend deployment, database hosting, environment variables, CORS, CI/CD, security. Start with 'You are a DevOps engineer...'",
  "masterPrompt": "A single combined prompt that includes all of the above, formatted as a copy-paste ready instruction for an AI coding agent to build the entire application from scratch."
}

Rules:
- Do NOT hallucinate unnecessary features. Only include what is relevant.
- Make reasonable assumptions and list them in "assumptions".
- Be detailed, technical, and accurate.
- Every prompt must be self-contained and actionable.
- Use free/open-source technologies by default.
- If a feature is ambiguous, choose the most common implementation.
- Never include placeholder or mock logic.
`;

export async function generatePrompts(input: PromptGenerationInput): Promise<GeneratedPrompts> {
  const userMessage = `Generate a complete development blueprint for the following application:

Project Name: ${input.projectName}
Description: ${input.description}
Platform: ${input.platform}
Target Users: ${input.targetUsers || 'Let AI decide'}
Main Features: ${input.features?.join(', ') || 'Let AI decide'}
Preferred Technology: ${input.technology || 'Let AI decide'}
Design Style: ${input.designStyle || 'Modern premium SaaS'}
Authentication: ${input.authentication || 'Email/password and Google OAuth'}
Database Preference: ${input.database || 'Let AI decide'}
AI Requirements: ${input.aiRequirements || 'None beyond prompt generation'}
Payment Requirements: ${input.payment || 'Not required'}
Admin Panel: ${input.adminPanel ?? false}
Extra Requirements: ${input.extraRequirements || 'None'}
Interview Answers: ${JSON.stringify(input.interviewAnswers || {})}

Remember to output ONLY valid JSON.`;

  // First attempt
  const rawOutput = await callGroq([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ]);

  // Parse JSON with retry logic
  let parsed: GeneratedPrompts;
  try {
    parsed = JSON.parse(rawOutput);
  } catch (error) {
    // Retry once with correction instruction
    const retryOutput = await callGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
      { role: 'assistant', content: rawOutput },
      { role: 'user', content: 'Your previous response was not valid JSON. Please fix it and return ONLY valid JSON.' },
    ]);
    try {
      parsed = JSON.parse(retryOutput);
    } catch {
      throw new Error('Failed to generate valid prompts. Please try again.');
    }
  }

  // Validate required fields
  if (!parsed.analysis || !parsed.websitePrompt || !parsed.masterPrompt) {
    throw new Error('AI output is incomplete. Please try again.');
  }

  return parsed;
}
