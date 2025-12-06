/**
 * Tests for costTracking.js
 * Testing cost calculation and token estimation
 */

// Mock AsyncStorage before importing costTracking
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { calculateCost, estimateTokens } from '../utils/costTracking';

// ============================================
// Test Suite for calculateCost
// ============================================

describe('calculateCost', () => {
  
  // Test 1: Basic cost calculation for grok-4-fast-non-reasoning
  test('should calculate cost for grok-4-fast-non-reasoning model', () => {
    // Model pricing: $0.20 per million input tokens, $0.50 per million output tokens
    const model = 'grok-4-fast-non-reasoning';
    const inputTokens = 100;
    const outputTokens = 200;
    
    const cost = calculateCost(model, inputTokens, outputTokens);
    
    // Expected: (100 / 1,000,000) * 0.20 + (200 / 1,000,000) * 0.50
    //         = 0.00002 + 0.0001
    //         = 0.00012
    expect(cost).toBeCloseTo(0.00012, 6);
  });

  // Test 2: YOUR TURN!
  // Calculate cost for the more expensive grok-4 model
  // Pricing: $3.00 per million input, $15.00 per million output
  test('should calculate cost for grok-4 model', () => {
    // TODO: Test with grok-4 model
    const model = 'grok-4';
    const inputTokens = 1000;
    const outputTokens = 500;

    const cost = calculateCost(model, inputTokens, outputTokens);
    // Hint: Use 1000 input tokens and 500 output tokens
    // Calculate what the expected cost should be
    expect(cost).toBeCloseTo(0.003 + 0.0075, 6); // 0.0105
    
  });

  // Test 3: Zero tokens should cost zero
  test('should return zero cost for zero tokens', () => {
    const cost = calculateCost('grok-4-fast-non-reasoning', 0, 0);
    expect(cost).toBe(0);
  });

  // Test 4: YOUR TURN!
  // What happens with an unknown model?
  // Check the code - it should fall back to grok-4-fast-non-reasoning pricing
  test('should use default pricing for unknown model', () => {
    // TODO: Test with a fake model name like 'unknown-model'
    const model = 'unknown-model';
    const inputTokens = 500;
    const outputTokens = 500;
    // It should give the same result as grok-4-fast-non-reasoning
    const cost = calculateCost(model, inputTokens, outputTokens);
    const expectedCost = calculateCost('grok-4-fast-non-reasoning', inputTokens, outputTokens);
    expect(cost).toBeCloseTo(expectedCost, 6);
  });

  // Test 5: Large numbers
  test('should handle large token counts', () => {
    const model = 'grok-4-fast-non-reasoning';
    const inputTokens = 1000000;  // 1 million
    const outputTokens = 1000000;  // 1 million
    
    const cost = calculateCost(model, inputTokens, outputTokens);
    
    // Expected: (1M / 1M) * 0.20 + (1M / 1M) * 0.50 = 0.20 + 0.50 = 0.70
    expect(cost).toBeCloseTo(0.70, 2);
  });
});

// ============================================
// Test Suite for estimateTokens
// ============================================

describe('estimateTokens', () => {
  
  // Test 6: Basic token estimation
  test('should estimate tokens for English text', () => {
    const text = 'Hello world';  // 11 characters
    const tokens = estimateTokens(text);
    
    // Expected: 11 / 3.5 = 3.14... rounds up to 4
    expect(tokens).toBe(4);
  });

  // Test 7: YOUR TURN!
  // Test with a longer French sentence
  test('should estimate tokens for French text', () => {
    // TODO: Use a French sentence like "Je mange une pomme dans le jardin"
    const text = 'Je mange une pomme dans le jardin'; // 33 characters
    const txt_length = text.length;
    const tokens = estimateTokens(text);
    // Count the characters (including spaces)
    // Divide by 3.5 and round up (use Math.ceil)
    expect(tokens).toBe(Math.ceil(txt_length / 3.5));
  });

  // Test 8: Empty string
  test('should return 0 tokens for empty string', () => {
    const tokens = estimateTokens('');
    expect(tokens).toBe(0);
  });

  // Test 9: Single character
  test('should return at least 1 token for single character', () => {
    const tokens = estimateTokens('a');
    // 1 / 3.5 = 0.28... rounds up to 1
    expect(tokens).toBe(1);
  });
});
