/**
 * Tests for rateLimiter.js
 * Testing rate limiting logic and request tracking
 */

import { rateLimiter } from '../utils/rateLimiter';

// Reset the rate limiter before each test
beforeEach(() => {
  rateLimiter.requests = [];
  rateLimiter.lastRequestTime = null;
});

// ============================================
// Test Suite for checkRateLimit
// ============================================

describe('checkRateLimit', () => {
  
  // Test 1: First request should always be allowed
  test('should allow first request', () => {
    const result = rateLimiter.checkRateLimit();
    
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe(null);
    expect(result.waitTime).toBe(0);
  });

  // Test 2: YOUR TURN!
  // Test the minimum delay (2 seconds) between requests
  // Hint: Use rateLimiter.recordRequest() then immediately check again
  test('should block requests within 2 seconds', () => {
    // TODO: Record a request, then immediately check if another is allowed
    rateLimiter.recordRequest();
    const result = rateLimiter.checkRateLimit();
    expect(result.allowed).toBe(false);
    expect(result.waitTime).toBeGreaterThan(0);
  });

  // Test 3: Allow request after minimum delay
  test('should allow request after 2 second delay', () => {
    // Record first request
    rateLimiter.recordRequest();
    
    // Simulate 2.1 seconds passing
    const originalNow = Date.now;
    Date.now = jest.fn(() => originalNow() + 2100);
    
    const result = rateLimiter.checkRateLimit();
    
    expect(result.allowed).toBe(true);
    
    // Restore Date.now
    Date.now = originalNow;
  });

  // Test 4: YOUR TURN!
  // Test the per-minute limit (10 requests max)
  test('should block 11th request within one minute', () => {
    // Add 10 requests within the last minute (spaced 3 seconds apart to avoid 2-second delay)
    const now = Date.now();
    for (let i = 0; i < 10; i++) {
      rateLimiter.requests.push(now - (i * 3000)); // 3 seconds apart
    }
    rateLimiter.lastRequestTime = now - 3000; // Last was 3 seconds ago
    
    const result = rateLimiter.checkRateLimit();
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('per minute');
  });

  // Test 5: Per-hour limit (50 requests max)
  test('should block 51st request within one hour', () => {
    // Add 50 requests spread over the past hour (older than 1 minute to avoid per-minute limit)
    const now = Date.now();
    const twoMinutesAgo = now - (2 * 60 * 1000);
    
    for (let i = 0; i < 50; i++) {
      // Spread requests between 2 minutes ago and 1 hour ago
      rateLimiter.requests.push(twoMinutesAgo - (i * 60 * 1000));
    }
    rateLimiter.lastRequestTime = twoMinutesAgo; // Last request was 2 minutes ago
    
    const result = rateLimiter.checkRateLimit();
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Hourly');
    expect(result.waitTime).toBe(3600);
  });

  // Test 6: Old requests should be cleaned up
  test('should allow request if old requests are cleaned up', () => {
    // Add 10 old requests (older than 1 hour)
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    for (let i = 0; i < 10; i++) {
      rateLimiter.requests.push(twoHoursAgo);
    }
    
    // Check rate limit - old requests should be filtered out
    const result = rateLimiter.checkRateLimit();
    
    expect(result.allowed).toBe(true);
    expect(rateLimiter.requests.length).toBe(0); // Old requests cleaned up
  });
});

// ============================================
// Test Suite for recordRequest
// ============================================

describe('recordRequest', () => {
  
  // Test 7: Should add timestamp to requests array
  test('should record request timestamp', () => {
    expect(rateLimiter.requests.length).toBe(0);
    
    rateLimiter.recordRequest();
    
    expect(rateLimiter.requests.length).toBe(1);
    expect(rateLimiter.lastRequestTime).toBeTruthy();
  });

  // Test 8: YOUR TURN!
  // Test that multiple requests are recorded
  test('should record multiple requests', () => {
    // TODO: Record 5 requests, check that requests.length is 5
    expect(rateLimiter.requests.length).toBe(0);
    for (let i = 0; i < 5; i++) {
      rateLimiter.recordRequest();
    }
    expect(rateLimiter.requests.length).toBe(5);
  });
});

// ============================================
// Test Suite for getStats
// ============================================

describe('getStats', () => {
  
  // Test 9: Should return correct initial stats
  test('should return zero stats initially', () => {
    const stats = rateLimiter.getStats();
    
    expect(stats.requestsThisMinute).toBe(0);
    expect(stats.requestsThisHour).toBe(0);
    expect(stats.maxPerMinute).toBe(10);
    expect(stats.maxPerHour).toBe(50);
  });

  // Test 10: Should count requests correctly
  test('should count recent requests', () => {
    // Record 3 requests
    rateLimiter.recordRequest();
    rateLimiter.recordRequest();
    rateLimiter.recordRequest();
    
    const stats = rateLimiter.getStats();
    
    expect(stats.requestsThisMinute).toBe(3);
    expect(stats.requestsThisHour).toBe(3);
  });
});
