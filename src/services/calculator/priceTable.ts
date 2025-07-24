import { PriceModel } from '../../types/index.js';

// Price data updated on 2025-07-24T09:22:26.946Z
// Sources:
// - Gemini API: https://ai.google.dev/gemini-api/docs/models + https://ai.google.dev/gemini-api/docs/pricing
// - Vertex AI: https://cloud.google.com/vertex-ai/generative-ai/pricing
export const PRICE_TABLE: Record<string, PriceModel> = {
  'gemini-2.5-pro': {
    inputTokenPrice: 0.00125,
    outputTokenPrice: 0.01,
    currency: 'USD',
    model: 'gemini-2.5-pro'
  },
  'gemini-2.5-flash': {
    inputTokenPrice: 0.0003,
    outputTokenPrice: 0.0025,
    currency: 'USD',
    model: 'gemini-2.5-flash'
  },
  'gemini-2.5-flash-lite': {
    inputTokenPrice: 0.0001,
    outputTokenPrice: 0.0004,
    currency: 'USD',
    model: 'gemini-2.5-flash-lite'
  },
  'gemini-2.0-flash': {
    inputTokenPrice: 0.0002,
    outputTokenPrice: 0.002,
    currency: 'USD',
    model: 'gemini-2.0-flash'
  },
  'gemini-2.0-flash-lite': {
    inputTokenPrice: 0.0002,
    outputTokenPrice: 0.002,
    currency: 'USD',
    model: 'gemini-2.0-flash-lite'
  },
  'gemini-1.5-pro': {
    inputTokenPrice: 0.00125,
    outputTokenPrice: 0.005,
    currency: 'USD',
    model: 'gemini-1.5-pro'
  },
  'gemini-1.5-flash': {
    inputTokenPrice: 0.000075,
    outputTokenPrice: 0.0003,
    currency: 'USD',
    model: 'gemini-1.5-flash'
  },
  'gemini-1.5-flash-8b': {
    inputTokenPrice: 0.000075,
    outputTokenPrice: 0.0003,
    currency: 'USD',
    model: 'gemini-1.5-flash-8b'
  },
  'gemini-pro': {
    inputTokenPrice: 0.000125,
    outputTokenPrice: 0.000375,
    currency: 'USD',
    model: 'gemini-pro'
  },
  'gemini-pro-vision': {
    inputTokenPrice: 0.000125,
    outputTokenPrice: 0.000375,
    currency: 'USD',
    model: 'gemini-pro-vision'
  },
  'gemini-1.5-pro-extended': {
    inputTokenPrice: 0.00125,
    outputTokenPrice: 0.005,
    currency: 'USD',
    model: 'gemini-1.5-pro-extended'
  },
  'gemini-1.5-flash-extended': {
    inputTokenPrice: 0.000075,
    outputTokenPrice: 0.0003,
    currency: 'USD',
    model: 'gemini-1.5-flash-extended'
  },
  'gemini-2.5-pro-extended': {
    inputTokenPrice: 0.00125,
    outputTokenPrice: 0.01,
    currency: 'USD',
    model: 'gemini-2.5-pro-extended'
  },
  'gemini-2.5-flash-audio': {
    inputTokenPrice: 0.0003,
    outputTokenPrice: 0.0025,
    currency: 'USD',
    model: 'gemini-2.5-flash-audio'
  },
  'gemini-2.5-flash-lite-audio': {
    inputTokenPrice: 0.0001,
    outputTokenPrice: 0.0004,
    currency: 'USD',
    model: 'gemini-2.5-flash-lite-audio'
  },
  'gemini-2.5-flash-native-audio': {
    inputTokenPrice: 0.0003,
    outputTokenPrice: 0.0025,
    currency: 'USD',
    model: 'gemini-2.5-flash-native-audio'
  },
  'gemini-2.5-flash-thinking': {
    inputTokenPrice: 0.0003,
    outputTokenPrice: 0.0025,
    currency: 'USD',
    model: 'gemini-2.5-flash-thinking'
  },
  'text-bison-001': {
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.001,
    currency: 'USD',
    model: 'text-bison-001'
  },
  'text-bison-002': {
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.001,
    currency: 'USD',
    model: 'text-bison-002'
  },
  'chat-bison-001': {
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.001,
    currency: 'USD',
    model: 'chat-bison-001'
  },
  'chat-bison-002': {
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.001,
    currency: 'USD',
    model: 'chat-bison-002'
  },
  'code-bison-001': {
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.001,
    currency: 'USD',
    model: 'code-bison-001'
  },
  'code-bison-002': {
    inputTokenPrice: 0.00025,
    outputTokenPrice: 0.0005,
    currency: 'USD',
    model: 'code-bison-002'
  },
  'codechat-bison-001': {
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.001,
    currency: 'USD',
    model: 'codechat-bison-001'
  },
  'codechat-bison-002': {
    inputTokenPrice: 0.00025,
    outputTokenPrice: 0.0005,
    currency: 'USD',
    model: 'codechat-bison-002'
  },
  'gemini-1.5-pro-vertex': {
    inputTokenPrice: 0.00125,
    outputTokenPrice: 0.005,
    currency: 'USD',
    model: 'gemini-1.5-pro-vertex'
  },
  'gemini-1.5-flash-vertex': {
    inputTokenPrice: 0.000075,
    outputTokenPrice: 0.0003,
    currency: 'USD',
    model: 'gemini-1.5-flash-vertex'
  },
  'gemini-2.5-pro-vertex': {
    inputTokenPrice: 0.00125,
    outputTokenPrice: 0.01,
    currency: 'USD',
    model: 'gemini-2.5-pro-vertex'
  },
  'gemini-2.5-flash-vertex': {
    inputTokenPrice: 0.0003,
    outputTokenPrice: 0.0025,
    currency: 'USD',
    model: 'gemini-2.5-flash-vertex'
  },
  'imagegeneration-004': {
    inputTokenPrice: 0.00004,
    outputTokenPrice: 0.00004,
    currency: 'USD',
    model: 'imagegeneration-004'
  },
  'imagegeneration-004-ultra': {
    inputTokenPrice: 0.000059999999999999995,
    outputTokenPrice: 0.000059999999999999995,
    currency: 'USD',
    model: 'imagegeneration-004-ultra'
  },
  'video-generation-001': {
    inputTokenPrice: 0.0005,
    outputTokenPrice: 0.00075,
    currency: 'USD',
    model: 'video-generation-001'
  },
};

// Currency conversion rates (USD to other currencies)
// These should be updated regularly or fetched from an API
export const CURRENCY_RATES: Record<string, number> = {
  'USD': 1.0,
  'JPY': 150.0  // As of early 2025, approximate rate
};

export function getPriceModel(modelName: string): PriceModel {
  const priceModel = PRICE_TABLE[modelName];
  
  if (!priceModel) {
    // Return default pricing for unknown models
    return {
      inputTokenPrice: 0.001,
      outputTokenPrice: 0.001,
      currency: 'USD',
      model: modelName
    };
  }

  return priceModel;
}

export function getAllSupportedModels(): string[] {
  return Object.keys(PRICE_TABLE);
}

export function getCurrencyRate(from: string, to: string): number {
  if (from === to) return 1.0;
  
  const fromRate = CURRENCY_RATES[from] || 1.0;
  const toRate = CURRENCY_RATES[to] || 1.0;
  
  return toRate / fromRate;
}

export function convertPrice(amount: number, fromCurrency: string, toCurrency: string): number {
  const rate = getCurrencyRate(fromCurrency, toCurrency);
  return amount * rate;
}
