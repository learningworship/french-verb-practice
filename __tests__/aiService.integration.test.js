/**
 * Integration Tests for AI Service
 * 
 * Tests how multiple components work together:
 * - aiService.js → grokProvider.js → security.js, costTracking.js
 * 
 * INTEGRATION TESTS vs UNIT TESTS:
 * - Unit tests: Test ONE function in isolation (like we did before)
 * - Integration tests: Test how multiple pieces work TOGETHER
 */

// Mock external dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the fetch API (we don't want to make real API calls in tests)
global.fetch = jest.fn();

import { evaluateSentence, getAvailableProviders } from '../utils/aiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// Test Suite for getAvailableProviders
// ============================================

describe('getAvailableProviders', () => {
  
  // Test 1: Should return list of providers
  test('should return array of available providers', () => {
    const providers = getAvailableProviders();
    
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
    expect(providers[0]).toHaveProperty('id');
    expect(providers[0]).toHaveProperty('name');
  });

  // Test 2: YOUR TURN!
  // Check that Grok is the default provider
  test('should have Grok as default provider', () => {
    // TODO: Get providers, find the one with default: true
    const providers = getAvailableProviders();
    const defaultProvider = providers.find(p => p.default === true);

    expect(defaultProvider).toBeDefined();
    expect(defaultProvider.id).toBe('grok');
    // Hint: Use providers.find(p => p.default === true)
    
  });
});

// ============================================
// Test Suite for evaluateSentence
// ============================================

describe('evaluateSentence', () => {

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 3: Should throw error if no API key
  test('should throw error when no API key is configured', async () => {
    // Mock: getCurrentProvider returns 'grok', but no API key
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@ai_provider') return Promise.resolve('grok');
      if (key === '@api_keys') return Promise.resolve(JSON.stringify({})); // No key!
      return Promise.resolve(null);
    });

    // Try to evaluate - should throw
    await expect(
      evaluateSentence('manger', 'Présent', 'Je mange une pomme')
    ).rejects.toThrow('No API key configured');
  });

  // Test 4: YOUR TURN!
  // Should throw error for unknown provider
  test('should throw error for unknown provider', async () => {
    // TODO: Mock getCurrentProvider to return 'unknown-provider'
    // Mock getApiKey to return a fake key (so it passes that check)
    // Then verify it throws 'Unknown AI provider'
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@ai_provider') return Promise.resolve('unknown-provider');
if (key === '@api_keys') return Promise.resolve(JSON.stringify({ "unknown-provider": "fake-key" }));      return Promise.resolve(null);
    });

    await expect(
      evaluateSentence('manger', 'Présent', 'Je mange une pomme')
    ).rejects.toThrow('Unknown AI provider');
    
  });

  // Test 5: Should make correct API call when everything is configured
  test('should call Grok API with correct parameters', async () => {
    // Mock: Provider is 'grok' and we have an API key
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@ai_provider') return Promise.resolve('grok');
      if (key === '@api_keys') return Promise.resolve(JSON.stringify({ grok: 'test-api-key-123' }));
      return Promise.resolve(null);
    });

    // Mock: Successful API response
    const mockAIResponse = {
      isCorrect: true,
      correctConjugation: '',
      verbAnalysis: 'Excellent conjugation of manger!',
      grammarIssues: [],
      semanticAnalysis: 'Natural French sentence.',
      alternativePhrasings: [],
      suggestion: 'Keep practicing!',
      encouragement: 'Great job!'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify(mockAIResponse)
          }
        }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50
        }
      })
    });

    // Call the service
    const result = await evaluateSentence('manger', 'Présent', 'Je mange une pomme');

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Verify the URL
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.x.ai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key-123'
        })
      })
    );

    // Verify the result has correct structure
    expect(result.isCorrect).toBe(true);
    expect(result.verbAnalysis).toContain('Excellent');
  });

  // Test 6: Should handle API errors gracefully
  test('should throw error when API returns error', async () => {
    // Mock: Provider and API key are configured
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@ai_provider') return Promise.resolve('grok');
      if (key === '@api_keys') return Promise.resolve(JSON.stringify({ grok: 'test-api-key-123' }));
      return Promise.resolve(null);
    });

    // Mock: API returns an error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({
        error: { message: 'Invalid API key' }
      })
    });

    // Should throw with the API error message
    await expect(
      evaluateSentence('manger', 'Présent', 'Je mange une pomme')
    ).rejects.toThrow('Invalid API key');
  });

  // Test 7: YOUR TURN!
  // Test security: Should reject malicious input
  test('should reject empty input', async () => {
    // TODO: Mock provider and API key
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@ai_provider') return Promise.resolve('grok');
      if (key === '@api_keys') return Promise.resolve(JSON.stringify({ grok: 'test-api-key-123' }));
      return Promise.resolve(null);
    })
    // Then try to call evaluateSentence with empty string ''
    // Should throw 'Invalid input'
    await expect(
      evaluateSentence('manger', 'Présent', '')
    ).rejects.toThrow('Invalid input');
    
  });
});

// ============================================
// Test Suite for End-to-End Flow
// ============================================

describe('End-to-End Flow', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 8: Complete flow from input to output
  test('should process French sentence through entire pipeline', async () => {
    // Setup: Configure mocks for full flow
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@ai_provider') return Promise.resolve('grok');
      if (key === '@api_keys') return Promise.resolve(JSON.stringify({ grok: 'real-key-here' }));
      if (key === '@cost_tracking') return Promise.resolve(JSON.stringify({
        totalRequests: 0,
        totalCost: 0,
        requests: []
      }));
      return Promise.resolve(null);
    });

    // Mock successful AI response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify({
              isCorrect: false,
              correctConjugation: 'mangeons',
              verbAnalysis: 'Wrong conjugation for nous',
              grammarIssues: ['Subject-verb agreement'],
              semanticAnalysis: 'Understandable but incorrect',
              alternativePhrasings: ['Nous mangeons des fruits'],
              suggestion: 'Remember: nous → -ons ending',
              encouragement: 'Keep practicing!'
            })
          }
        }],
        usage: { prompt_tokens: 150, completion_tokens: 80 }
      })
    });

    // Execute the full flow
    const result = await evaluateSentence(
      'manger',
      'Présent',
      'Nous mange des fruits'  // Intentionally wrong
    );

    // Verify the complete result structure
    expect(result).toMatchObject({
      isCorrect: false,
      correctConjugation: 'mangeons',
      verbAnalysis: expect.any(String),
      grammarIssues: expect.any(Array),
      semanticAnalysis: expect.any(String),
      alternativePhrasings: expect.any(Array),
      suggestion: expect.any(String),
      encouragement: expect.any(String),
      timestamp: expect.any(String),
    });

    // Verify specific values
    expect(result.grammarIssues).toContain('Subject-verb agreement');
    expect(result.alternativePhrasings).toHaveLength(1);
  });
});
