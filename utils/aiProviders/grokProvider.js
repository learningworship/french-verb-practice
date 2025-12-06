/**
 * Grok AI Provider
 * Handles communication with xAI's Grok API
 */

import { sanitizeUserInput, validateFrenchSentence } from '../security';
import { estimateTokens, recordUsage } from '../costTracking';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL_NAME = 'grok-4-fast-non-reasoning';

/**
 * Call Grok API to evaluate a French sentence
 * @param {string} verb - The infinitive form of the verb
 * @param {string} tense - The tense name (e.g., "Présent")
 * @param {string} userSentence - The sentence written by the user
 * @param {string} apiKey - The Grok API key
 * @returns {Promise<Object>} Response with corrections and suggestions
 */
export async function evaluateSentence(verb, tense, userSentence, apiKey) {
  try {
    // Security: Sanitize user input to prevent prompt injection
    const sanitizedSentence = sanitizeUserInput(userSentence);
    
    // Validate it looks like a French sentence
    if (!validateFrenchSentence(sanitizedSentence)) {
      throw new Error('Input does not appear to be a valid sentence');
    }
    
    // Build the prompt for Grok
    const prompt = buildPrompt(verb, tense, sanitizedSentence);

    // Make the API request
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME, // Fast, cost-effective model
        messages: [
          {
            role: 'system',
            content: 'You are a French language teacher who provides constructive feedback on verb conjugation and sentence structure. Be encouraging but accurate.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower = more consistent/accurate
      }),
    });

    // Check if request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('No response from AI');
    }

    // Track usage and cost
    try {
      const usage = data.usage;
      if (usage) {
        await recordUsage(
          MODEL_NAME,
          usage.prompt_tokens || estimateTokens(prompt),
          usage.completion_tokens || estimateTokens(aiMessage)
        );
      }
    } catch (costError) {
      console.error('Error recording usage:', costError);
      // Don't fail the request if cost tracking fails
    }

    // Parse the AI's feedback into structured data
    return parseAIResponse(aiMessage);

  } catch (error) {
    console.error('Grok API Error:', error);
    throw error;
  }
}

/**
 * Build the prompt that asks Grok to evaluate the sentence
 * Uses JSON format for structured, parseable responses
 */
function buildPrompt(verb, tense, userSentence) {
  return `You are a French language teacher evaluating a student's sentence.

Verb (infinitive): ${verb}
Required tense: ${tense}
Student's sentence: "${userSentence}"

Analyze the sentence thoroughly and respond with ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "isCorrect": true or false (whether the verb is conjugated correctly),
  "correctConjugation": "the correct conjugation if wrong, or empty string if correct",
  "verbAnalysis": "brief explanation of the verb conjugation",
  "grammarIssues": ["list of any grammar or structure issues, or empty array if none"],
  "semanticAnalysis": "evaluate if the sentence sounds natural to a native French speaker, or if there's a more idiomatic way to express the same idea",
  "alternativePhrasings": ["1-2 more natural French alternatives, or empty array if the sentence is already natural"],
  "suggestion": "one helpful tip for improvement",
  "encouragement": "brief positive comment"
}

Be constructive, encouraging, and focus on helping the student sound more like a native French speaker.`;
}

/**
 * Parse the AI's JSON response into structured data
 */
function parseAIResponse(aiText) {
  try {
    // Remove any markdown code blocks if present
    let cleanText = aiText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }
    
    // Parse the JSON
    const parsed = JSON.parse(cleanText);
    
    // Return structured data with fallbacks
    return {
      isCorrect: parsed.isCorrect === true,
      correctConjugation: parsed.correctConjugation || '',
      verbAnalysis: parsed.verbAnalysis || '',
      grammarIssues: Array.isArray(parsed.grammarIssues) ? parsed.grammarIssues : [],
      semanticAnalysis: parsed.semanticAnalysis || '',
      alternativePhrasings: Array.isArray(parsed.alternativePhrasings) ? parsed.alternativePhrasings : [],
      suggestion: parsed.suggestion || '',
      encouragement: parsed.encouragement || '',
      fullFeedback: aiText, // Keep original for debugging
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    console.log('Raw response:', aiText);
    
    // Fallback to basic parsing if JSON fails
    return {
      isCorrect: aiText.toLowerCase().includes('correct'),
      correctConjugation: '',
      verbAnalysis: '',
      grammarIssues: [],
      semanticAnalysis: '',
      alternativePhrasings: [],
      suggestion: '',
      encouragement: '',
      fullFeedback: aiText,
      timestamp: new Date().toISOString(),
      parseError: true, // Flag that parsing failed
    };
  }
}
