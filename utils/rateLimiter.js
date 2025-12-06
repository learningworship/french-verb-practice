/**
 * Rate Limiting Utility
 * Prevents API abuse and excessive costs
 */

class RateLimiter {
  constructor() {
    this.requests = []; // Array of timestamps
    this.MAX_REQUESTS_PER_MINUTE = 10;
    this.MAX_REQUESTS_PER_HOUR = 50;
    this.lastRequestTime = null;
    this.MIN_DELAY_MS = 2000; // Minimum 2 seconds between requests
  }

  /**
   * Check if a request is allowed based on rate limits
   * @returns {Object} { allowed: boolean, reason: string, waitTime: number }
   */
  checkRateLimit() {
    const now = Date.now();
    
    // Check minimum delay between requests
    if (this.lastRequestTime) {
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_DELAY_MS) {
        const waitTime = Math.ceil((this.MIN_DELAY_MS - timeSinceLastRequest) / 1000);
        return {
          allowed: false,
          reason: `Please wait ${waitTime} seconds between submissions`,
          waitTime,
        };
      }
    }

    // Clean up old requests (older than 1 hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    this.requests = this.requests.filter(time => time > oneHourAgo);

    // Check per-minute limit
    const oneMinuteAgo = now - (60 * 1000);
    const requestsInLastMinute = this.requests.filter(time => time > oneMinuteAgo).length;
    
    if (requestsInLastMinute >= this.MAX_REQUESTS_PER_MINUTE) {
      return {
        allowed: false,
        reason: 'Too many requests per minute. Please slow down.',
        waitTime: 60,
      };
    }

    // Check per-hour limit
    if (this.requests.length >= this.MAX_REQUESTS_PER_HOUR) {
      return {
        allowed: false,
        reason: 'Hourly request limit reached. Please try again later.',
        waitTime: 3600,
      };
    }

    return { allowed: true, reason: null, waitTime: 0 };
  }

  /**
   * Record a request
   */
  recordRequest() {
    const now = Date.now();
    this.requests.push(now);
    this.lastRequestTime = now;
  }

  /**
   * Get current usage stats
   * @returns {Object} Usage statistics
   */
  getStats() {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const requestsInLastMinute = this.requests.filter(time => time > oneMinuteAgo).length;

    return {
      requestsThisMinute: requestsInLastMinute,
      requestsThisHour: this.requests.length,
      maxPerMinute: this.MAX_REQUESTS_PER_MINUTE,
      maxPerHour: this.MAX_REQUESTS_PER_HOUR,
    };
  }
}

// Export a singleton instance
export const rateLimiter = new RateLimiter();
