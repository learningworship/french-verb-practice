/**
 * Cost Tracking and Budget Management
 * Helps users monitor and limit API spending
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cost_tracking';

// Grok pricing (per million tokens)
const PRICING = {
  'grok-4-fast-non-reasoning': {
    input: 0.20,
    output: 0.50,
  },
  'grok-4': {
    input: 3.00,
    output: 15.00,
  },
};

/**
 * Calculate cost of a request
 * @param {string} model - Model name
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @returns {number} Cost in dollars
 */
export function calculateCost(model, inputTokens, outputTokens) {
  const pricing = PRICING[model] || PRICING['grok-4-fast-non-reasoning'];
  
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;
  
  return inputCost + outputCost;
}

/**
 * Estimate tokens in text (rough approximation)
 * Real: ~4 characters per token in English, ~3 in French
 * @param {string} text
 * @returns {number} Estimated tokens
 */
export function estimateTokens(text) {
  return Math.ceil(text.length / 3.5);
}

/**
 * Get usage statistics
 * @returns {Promise<Object>} Usage stats
 */
export async function getUsageStats() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        totalRequests: 0,
        totalCost: 0,
        dailyCost: 0,
        weeklyCost: 0,
        monthlyCost: 0,
        lastResetDate: new Date().toISOString(),
        requests: [],
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return null;
  }
}

/**
 * Record a request and its cost
 * @param {string} model - Model used
 * @param {number} inputTokens - Input tokens
 * @param {number} outputTokens - Output tokens
 */
export async function recordUsage(model, inputTokens, outputTokens) {
  try {
    const stats = await getUsageStats();
    const cost = calculateCost(model, inputTokens, outputTokens);
    
    const request = {
      timestamp: Date.now(),
      model,
      inputTokens,
      outputTokens,
      cost,
    };
    
    stats.requests.push(request);
    stats.totalRequests += 1;
    stats.totalCost += cost;
    
    // Calculate time-based costs
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    stats.dailyCost = stats.requests
      .filter(r => r.timestamp > oneDayAgo)
      .reduce((sum, r) => sum + r.cost, 0);
    
    stats.weeklyCost = stats.requests
      .filter(r => r.timestamp > oneWeekAgo)
      .reduce((sum, r) => sum + r.cost, 0);
    
    stats.monthlyCost = stats.requests
      .filter(r => r.timestamp > oneMonthAgo)
      .reduce((sum, r) => sum + r.cost, 0);
    
    // Clean up old requests (keep only last 30 days)
    stats.requests = stats.requests.filter(r => r.timestamp > oneMonthAgo);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    return stats;
  } catch (error) {
    console.error('Error recording usage:', error);
    throw error;
  }
}

/**
 * Check if user is within budget
 * @param {Object} budget - Budget limits
 * @returns {Promise<Object>} { allowed: boolean, reason: string }
 */
export async function checkBudget(budget = {}) {
  const defaultBudget = {
    daily: 1.00,    // $1 per day
    weekly: 5.00,   // $5 per week
    monthly: 15.00, // $15 per month
  };
  
  const limits = { ...defaultBudget, ...budget };
  const stats = await getUsageStats();
  
  if (!stats) {
    return { allowed: true, reason: null };
  }
  
  if (stats.dailyCost >= limits.daily) {
    return {
      allowed: false,
      reason: `Daily budget limit reached ($${stats.dailyCost.toFixed(4)} / $${limits.daily})`,
      currentCost: stats.dailyCost,
      limit: limits.daily,
      period: 'daily',
    };
  }
  
  if (stats.weeklyCost >= limits.weekly) {
    return {
      allowed: false,
      reason: `Weekly budget limit reached ($${stats.weeklyCost.toFixed(4)} / $${limits.weekly})`,
      currentCost: stats.weeklyCost,
      limit: limits.weekly,
      period: 'weekly',
    };
  }
  
  if (stats.monthlyCost >= limits.monthly) {
    return {
      allowed: false,
      reason: `Monthly budget limit reached ($${stats.monthlyCost.toFixed(4)} / $${limits.monthly})`,
      currentCost: stats.monthlyCost,
      limit: limits.monthly,
      period: 'monthly',
    };
  }
  
  return { allowed: true, reason: null };
}

/**
 * Get/Set user budget preferences
 */
export async function getBudgetLimits() {
  try {
    const data = await AsyncStorage.getItem('@budget_limits');
    return data ? JSON.parse(data) : {
      daily: 1.00,
      weekly: 5.00,
      monthly: 15.00,
    };
  } catch (error) {
    console.error('Error getting budget limits:', error);
    return null;
  }
}

export async function setBudgetLimits(limits) {
  try {
    await AsyncStorage.setItem('@budget_limits', JSON.stringify(limits));
    return true;
  } catch (error) {
    console.error('Error setting budget limits:', error);
    throw error;
  }
}

/**
 * Reset usage statistics
 */
export async function resetUsageStats() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting usage stats:', error);
    throw error;
  }
}
