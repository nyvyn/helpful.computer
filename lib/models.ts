/**
 * OpenAI model definitions used throughout the application
 */

export const MODELS = {
  // Realtime models
  REALTIME: "gpt-4o-realtime-preview-2025-06-03",
  
  // Chat completion models
  FAST: "gpt-5-mini",
  CAPABLE: "gpt-5",
  PLAID: "gpt-5-nano",
} as const;