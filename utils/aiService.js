/**
 * AI Service - Abstraction Layer
 * 
 * This is the ONLY file that PracticeScreen (or other screens) should import.
 * It handles:
 * - Which AI provider to use
 * - Getting API keys from storage
 * - Providing a consistent interface regardless of provider
 */

import * as grokProvider from './aiProviders/grokProvider';
import { getApiKey, getCurrentProvider } from './storage';

/**
 * Evaluate a French sentence using the currently selected AI provider
 * 
 * @param {string} verb - Infinitive form of the verb
 * @param {string} tense - The tense name
 * @param {string} userSentence - User's sentence to evaluate
 * @returns {Promise<Object>} Evaluation result with feedback
 * @throws {Error} If API call fails or no API key is configured
 */
export async function evaluateSentence(verb, tense, userSentence) {
  // Get the current provider setting (e.g., 'grok', 'openai')
  const provider = await getCurrentProvider();
  
  // Get the API key for that provider
  const apiKey = await getApiKey(provider);
  
  // Validate we have an API key
  if (!apiKey) {
    throw new Error('No API key configured. Please add one in Settings.');
  }

  // Route to the correct provider
  switch (provider) {
    case 'grok':
      return await grokProvider.evaluateSentence(verb, tense, userSentence, apiKey);
    
    // Future providers can be added here:
    // case 'openai':
    //   return await openaiProvider.evaluateSentence(verb, tense, userSentence, apiKey);
    
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Get list of available AI providers
 * Useful for the Settings screen dropdown
 */
export function getAvailableProviders() {
  return [
    { id: 'grok', name: 'Grok (xAI)', default: true },
    // { id: 'openai', name: 'OpenAI (GPT-4)', default: false },
    // { id: 'claude', name: 'Anthropic (Claude)', default: false },
  ];
}
