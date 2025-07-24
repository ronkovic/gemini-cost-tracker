import { Usage, PriceModel } from '../../src/types/index.js';

// Mock usage data for testing
export const mockUsageData: Usage[] = [
  {
    id: 'mock-gemini-1',
    timestamp: new Date('2025-01-15T10:00:00Z'),
    service: 'gemini',
    model: 'gemini-2.5-pro',
    inputTokens: 2500,
    outputTokens: 1200,
    project: 'test-project-1',
    region: 'us-central1',
  },
  {
    id: 'mock-gemini-2',
    timestamp: new Date('2025-01-15T11:00:00Z'),
    service: 'gemini',
    model: 'gemini-2.5-flash',
    inputTokens: 5000,
    outputTokens: 2000,
    project: 'test-project-1',
    region: 'us-central1',
  },
  {
    id: 'mock-vertex-1',
    timestamp: new Date('2025-01-15T12:00:00Z'),
    service: 'vertex-ai',
    model: 'text-bison-001',
    inputTokens: 3000,
    outputTokens: 1500,
    project: 'test-project-2',
    region: 'us-west1',
  },
  {
    id: 'mock-vertex-2',
    timestamp: new Date('2025-01-15T13:00:00Z'),
    service: 'vertex-ai',
    model: 'gemini-1.5-pro-vertex',
    inputTokens: 1800,
    outputTokens: 800,
    project: 'test-project-2',
    region: 'us-west1',
  },
];

// Mock Google Cloud Logging API responses
export const mockLoggingEntries = [
  {
    data: {
      protoPayload: {
        serviceName: 'generativelanguage.googleapis.com',
        methodName: 'google.ai.generativelanguage.v1beta.GenerativeService.GenerateContent',
        resourceName: 'models/gemini-2.5-pro:generateContent',
        request: {
          model: 'models/gemini-2.5-pro',
          contents: [{
            parts: [{ text: 'What is machine learning?' }]
          }],
          location: 'us-central1'
        },
        response: {
          candidates: [{
            content: {
              parts: [{ text: 'Machine learning is a subset of artificial intelligence...' }]
            }
          }],
          usageMetadata: {
            promptTokenCount: 2500,
            candidatesTokenCount: 1200,
            totalTokenCount: 3700
          }
        }
      }
    },
    metadata: {
      timestamp: '2025-01-15T10:00:00.000Z'
    }
  },
  {
    data: {
      protoPayload: {
        serviceName: 'generativelanguage.googleapis.com',
        methodName: 'google.ai.generativelanguage.v1beta.GenerativeService.GenerateContent',
        resourceName: 'models/gemini-2.5-flash:generateContent',
        request: {
          model: 'models/gemini-2.5-flash',
          contents: [{
            parts: [{ text: 'Explain quantum computing' }]
          }],
          location: 'us-central1'
        },
        response: {
          candidates: [{
            content: {
              parts: [{ text: 'Quantum computing leverages quantum mechanics...' }]
            }
          }],
          usageMetadata: {
            promptTokenCount: 5000,
            candidatesTokenCount: 2000,
            totalTokenCount: 7000
          }
        }
      }
    },
    metadata: {
      timestamp: '2025-01-15T11:00:00.000Z'
    }
  }
];

// Mock Google Cloud Monitoring API responses
export const mockMonitoringTimeSeries = [
  {
    resource: {
      labels: {
        model_id: 'text-bison-001'
      }
    },
    points: [
      {
        interval: {
          startTime: {
            seconds: Math.floor(new Date('2025-01-15T12:00:00Z').getTime() / 1000)
          }
        },
        value: {
          doubleValue: 2.0 // 2 requests
        }
      }
    ]
  },
  {
    resource: {
      labels: {
        model_id: 'gemini-1.5-pro-vertex'
      }
    },
    points: [
      {
        interval: {
          startTime: {
            seconds: Math.floor(new Date('2025-01-15T13:00:00Z').getTime() / 1000)
          }
        },
        value: {
          doubleValue: 1.0 // 1 request
        }
      }
    ]
  }
];

// Mock price models for testing
export const mockPriceModels: Record<string, PriceModel> = {
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
  'gemini-2.0-flash': {
    inputTokenPrice: 0.0002,
    outputTokenPrice: 0.002,
    currency: 'USD',
    model: 'gemini-2.0-flash'
  },
  'text-bison-001': {
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.001,
    currency: 'USD',
    model: 'text-bison-001'
  },
  'gemini-1.5-pro-vertex': {
    inputTokenPrice: 0.00125,
    outputTokenPrice: 0.005,
    currency: 'USD',
    model: 'gemini-1.5-pro-vertex'
  }
};

// Mock web responses for pricing and model data
export const mockWebResponses = {
  modelsPage: `
    Latest Gemini API Models Documentation
    
    Stable Models:
    - Gemini 2.5 Pro (gemini-2.5-pro): Enhanced thinking and reasoning
    - Gemini 2.5 Flash (gemini-2.5-flash): Adaptive thinking, cost efficiency
    - Gemini 2.0 Flash (gemini-2.0-flash): Next-gen features, superior speed
    
    Legacy Models:
    - Gemini 1.5 Pro (gemini-1.5-pro): Multimodal reasoning
    - Gemini 1.5 Flash (gemini-1.5-flash): Fast inference
    - Gemini Pro (gemini-pro): Classic model
  `,
  
  pricingPage: `
    Gemini API Pricing
    
    Gemini 2.5 Pro:
    - Input: $1.25 per 1M tokens
    - Output: $10.00 per 1M tokens
    
    Gemini 2.5 Flash:
    - Input: $0.30 per 1M tokens
    - Output: $2.50 per 1M tokens
    
    Gemini 2.0 Flash:
    - Input: $0.20 per 1M tokens
    - Output: $2.00 per 1M tokens
  `,
  
  vertexPricingPage: `
    Vertex AI Generative AI Pricing
    
    PaLM 2 for Text (text-bison-001):
    - Input and output: $1.00 per 1M tokens
    
    Gemini 1.5 Pro on Vertex:
    - Input: $1.25 per 1M tokens
    - Output: $5.00 per 1M tokens
  `
};

// Mock error responses
export const mockErrorResponses = {
  networkError: new Error('Network connection failed'),
  authError: new Error('Authentication failed: Invalid credentials'),
  rateLimitError: new Error('Rate limit exceeded: Too many requests'),
  notFoundError: new Error('Resource not found: 404'),
  permissionError: new Error('Permission denied: Insufficient privileges'),
  
  googleCloudErrors: {
    loggingUnavailable: new Error('Cloud Logging API is not available'),
    monitoringUnavailable: new Error('Cloud Monitoring API is not available'),
    billingUnavailable: new Error('Cloud Billing API is not available'),
    invalidProject: new Error('Project not found or access denied')
  },
  
  apiErrors: {
    invalidModel: new Error('Model not found: gemini-invalid-model'),
    malformedRequest: new Error('Invalid request format'),
    quotaExceeded: new Error('API quota exceeded'),
    serviceUnavailable: new Error('Service temporarily unavailable')
  }
};

// Mock configuration data
export const mockConfig = {
  validCredentials: {
    geminiApiKey: 'test-gemini-api-key-123',
    gcpProjectId: 'test-project-123',
    gcpKeyFile: '/path/to/test-service-account.json'
  },
  
  invalidCredentials: {
    geminiApiKey: 'invalid-key',
    gcpProjectId: 'invalid-project',
    gcpKeyFile: '/path/to/invalid.json'
  },
  
  missingCredentials: {
    geminiApiKey: '',
    gcpProjectId: '',
    gcpKeyFile: ''
  }
};

// Helper functions for creating test data
export function createMockUsage(overrides: Partial<Usage> = {}): Usage {
  return {
    id: 'mock-usage-id',
    timestamp: new Date(),
    service: 'gemini',
    model: 'gemini-2.5-pro',
    inputTokens: 1000,
    outputTokens: 500,
    project: 'test-project',
    region: 'us-central1',
    ...overrides
  };
}

export function createMockUsageArray(count: number, baseOverrides: Partial<Usage> = {}): Usage[] {
  return Array.from({ length: count }, (_, index) => 
    createMockUsage({
      id: `mock-usage-${index}`,
      timestamp: new Date(Date.now() + index * 60000), // 1 minute apart
      ...baseOverrides
    })
  );
}