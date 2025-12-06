import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_VERBS } from '../data/defaultVerbs';

// Storage keys - like "addresses" for our data
const STORAGE_KEYS = {
  VERBS: '@verbs',
  INITIALIZED: '@initialized',
  CURRENT_PROVIDER: '@ai_provider',
  API_KEYS: '@api_keys'
};

/**
 * Generate a unique ID for new verbs
 * Uses timestamp + random number for uniqueness
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Initialize app with default verbs (runs only once)
 * Returns true if initialization happened, false if already initialized
 */
export const initializeDefaultVerbs = async () => {
  try {
    // Check if we've already initialized
    const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
    
    if (initialized === 'true') {
      console.log('App already initialized with default verbs');
      return false;
    }

    // Transform default verbs into our full data structure
    const verbs = DEFAULT_VERBS.map(({ verb, translation }) => ({
      id: generateId(),
      verb,
      translation,
      addedAt: Date.now(),
      isDefault: true,
      practiceCount: 0
    }));

    // Save to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.VERBS, JSON.stringify(verbs));
    await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    
    console.log(`Initialized app with ${verbs.length} default verbs`);
    return true;
  } catch (error) {
    console.error('Error initializing default verbs:', error);
    throw error;
  }
};

/**
 * Get all verbs from storage
 * Returns array of verb objects
 */
export const getAllVerbs = async () => {
  try {
    const verbsJson = await AsyncStorage.getItem(STORAGE_KEYS.VERBS);
    
    if (!verbsJson) {
      return [];
    }
    
    return JSON.parse(verbsJson);
  } catch (error) {
    console.error('Error getting verbs:', error);
    return [];
  }
};

/**
 * Add a new verb to storage
 * Automatically converts to infinitive form (basic implementation)
 * Returns the newly created verb object
 */
export const addVerb = async (verb, translation) => {
  try {
    // Get existing verbs
    const verbs = await getAllVerbs();
    
    // Clean the verb (trim whitespace, lowercase)
    const cleanedVerb = verb.trim().toLowerCase();
    
    // Check if verb already exists
    const exists = verbs.some(v => v.verb.toLowerCase() === cleanedVerb);
    if (exists) {
      throw new Error(`Verb "${cleanedVerb}" already exists`);
    }
    
    // Create new verb object
    const newVerb = {
      id: generateId(),
      verb: cleanedVerb,
      translation: translation.trim(),
      addedAt: Date.now(),
      isDefault: false,
      practiceCount: 0
    };
    
    // Add to array and save
    verbs.push(newVerb);
    await AsyncStorage.setItem(STORAGE_KEYS.VERBS, JSON.stringify(verbs));
    
    console.log(`Added new verb: ${cleanedVerb}`);
    return newVerb;
  } catch (error) {
    console.error('Error adding verb:', error);
    throw error;
  }
};

/**
 * Delete a verb by ID
 * Cannot delete default verbs (safety feature)
 * Returns true if deleted, false if not found or is default
 */
export const deleteVerb = async (verbId) => {
  try {
    const verbs = await getAllVerbs();
    
    // Find the verb
    const verb = verbs.find(v => v.id === verbId);
    
    if (!verb) {
      throw new Error('Verb not found');
    }
    
    if (verb.isDefault) {
      throw new Error('Cannot delete default verbs');
    }
    
    // Filter out the verb
    const updatedVerbs = verbs.filter(v => v.id !== verbId);
    await AsyncStorage.setItem(STORAGE_KEYS.VERBS, JSON.stringify(updatedVerbs));
    
    console.log(`Deleted verb: ${verb.verb}`);
    return true;
  } catch (error) {
    console.error('Error deleting verb:', error);
    throw error;
  }
};

/**
 * Get a random verb from storage
 * Returns a random verb object or null if no verbs
 */
export const getRandomVerb = async () => {
  try {
    const verbs = await getAllVerbs();
    
    if (verbs.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * verbs.length);
    return verbs[randomIndex];
  } catch (error) {
    console.error('Error getting random verb:', error);
    return null;
  }
};

/**
 * Increment practice count for a verb
 * Updates the practiceCount field
 */
export const incrementPracticeCount = async (verbId) => {
  try {
    const verbs = await getAllVerbs();
    
    // Find and update the verb
    const updatedVerbs = verbs.map(verb => {
      if (verb.id === verbId) {
        return {
          ...verb,
          practiceCount: verb.practiceCount + 1
        };
      }
      return verb;
    });
    
    await AsyncStorage.setItem(STORAGE_KEYS.VERBS, JSON.stringify(updatedVerbs));
    return true;
  } catch (error) {
    console.error('Error incrementing practice count:', error);
    throw error;
  }
};

/**
 * Clear all data (useful for development/testing)
 * USE WITH CAUTION!
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

// ============================================
// AI Provider & API Key Management
// ============================================

/**
 * Get the current AI provider setting
 * Returns 'grok' by default
 */
export const getCurrentProvider = async () => {
  try {
    const provider = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PROVIDER);
    return provider || 'grok'; // Default to Grok
  } catch (error) {
    console.error('Error getting current provider:', error);
    return 'grok';
  }
};

/**
 * Set the current AI provider
 * @param {string} provider - Provider ID (e.g., 'grok', 'openai')
 */
export const setCurrentProvider = async (provider) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PROVIDER, provider);
    console.log(`AI provider set to: ${provider}`);
    return true;
  } catch (error) {
    console.error('Error setting current provider:', error);
    throw error;
  }
};

/**
 * Get API key for a specific provider
 * @param {string} provider - Provider ID (e.g., 'grok', 'openai')
 * @returns {Promise<string|null>} The API key or null if not set
 */
export const getApiKey = async (provider) => {
  try {
    const apiKeysJson = await AsyncStorage.getItem(STORAGE_KEYS.API_KEYS);
    
    if (!apiKeysJson) {
      return null;
    }
    
    const apiKeys = JSON.parse(apiKeysJson);
    return apiKeys[provider] || null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

/**
 * Save API key for a specific provider
 * @param {string} provider - Provider ID (e.g., 'grok', 'openai')
 * @param {string} apiKey - The API key to save
 */
export const saveApiKey = async (provider, apiKey) => {
  try {
    // Get existing API keys
    const apiKeysJson = await AsyncStorage.getItem(STORAGE_KEYS.API_KEYS);
    const apiKeys = apiKeysJson ? JSON.parse(apiKeysJson) : {};
    
    // Update with new key
    apiKeys[provider] = apiKey.trim();
    
    // Save back to storage
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys));
    console.log(`API key saved for provider: ${provider}`);
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
};

/**
 * Delete API key for a specific provider
 * @param {string} provider - Provider ID (e.g., 'grok', 'openai')
 */
export const deleteApiKey = async (provider) => {
  try {
    const apiKeysJson = await AsyncStorage.getItem(STORAGE_KEYS.API_KEYS);
    
    if (!apiKeysJson) {
      return true; // Nothing to delete
    }
    
    const apiKeys = JSON.parse(apiKeysJson);
    delete apiKeys[provider];
    
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys));
    console.log(`API key deleted for provider: ${provider}`);
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};

