export const DEFAULT_CONFIG = {
  CURRENCY: 'USD' as const,
  FORMAT: 'table' as const,
  PERIOD: 'week' as const,
} as const;

export const API_ENDPOINTS = {
  GEMINI_API: 'https://generativelanguage.googleapis.com/v1',
  VERTEX_AI_API: 'https://aiplatform.googleapis.com/v1',
  PRICING_URLS: {
    GEMINI: 'https://ai.google.dev/gemini-api/docs/pricing',
    GEMINI_MODELS: 'https://ai.google.dev/gemini-api/docs/models',
    VERTEX_AI: 'https://cloud.google.com/vertex-ai/generative-ai/pricing',
  },
} as const;

export const SUPPORTED_MODELS = {
  GEMINI: [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-pro-extended',
    'gemini-1.5-flash-extended',
    'gemini-2.5-pro-extended',
    'gemini-2.5-flash-audio',
    'gemini-2.5-flash-lite-audio',
    'gemini-2.5-flash-native-audio',
    'gemini-2.5-flash-thinking',
  ],
  VERTEX_AI: [
    'text-bison-001',
    'text-bison-002',
    'chat-bison-001',
    'chat-bison-002',
    'codechat-bison-001',
    'codechat-bison-002',
    'gemini-1.5-pro-vertex',
    'gemini-1.5-flash-vertex',
    'gemini-2.5-pro-vertex',
    'gemini-2.5-flash-vertex',
  ],
} as const;

export const FILE_PATHS = {
  CONFIG_DIR: '.gemini-cost-tracker',
  CONFIG_FILE: 'config.json',
  CREDENTIALS_FILE: 'credentials.json',
  CACHE_DIR: 'cache',
  LOGS_DIR: 'logs',
} as const;

export const ERROR_MESSAGES = {
  INVALID_DATE_RANGE: 'Invalid date range: start date must be before end date',
  MISSING_API_KEY: 'API key is required but not provided',
  INVALID_PROJECT_ID: 'Invalid GCP project ID format',
  NETWORK_ERROR: 'Network error occurred while fetching data',
  AUTHENTICATION_FAILED: 'Authentication failed - check your credentials',
  FILE_NOT_FOUND: 'Required configuration file not found',
  INVALID_FORMAT: 'Invalid output format specified',
} as const;
