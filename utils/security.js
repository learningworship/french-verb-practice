/**
 * Security and Input Validation Utilities
 * Protects against prompt injection and malicious input
 */

/**
 * Sanitize user input to prevent prompt injection
 * @param {string} input - The user's sentence
 * @returns {string} Sanitized input
 */
export function sanitizeUserInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }

  // Remove excessive whitespace
  let sanitized = input.trim().replace(/\s+/g, ' ');

  // Check for suspicious patterns that might indicate prompt injection
  const suspiciousPatterns = [
    /ignore\s+(previous|above|all)\s+instructions?/gi,
    /system\s+prompt/gi,
    /you\s+are\s+(now|actually)/gi,
    /forget\s+(everything|all|previous)/gi,
    /new\s+instructions?:/gi,
    /role\s*:\s*system/gi,
    /\[system\]/gi,
    /assistant\s+mode/gi,
  ];

  const containsSuspiciousContent = suspiciousPatterns.some(pattern => 
    pattern.test(sanitized)
  );

  if (containsSuspiciousContent) {
    console.warn('Potential prompt injection detected:', sanitized);
    // Option 1: Throw error (strict)
    // throw new Error('Invalid input detected');
    
    // Option 2: Strip suspicious content (lenient)
    suspiciousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[redacted]');
    });
  }

  // Length validation (prevent extremely long inputs)
  const MAX_LENGTH = 500; // characters
  if (sanitized.length > MAX_LENGTH) {
    throw new Error(`Sentence too long (max ${MAX_LENGTH} characters)`);
  }

  // Minimum length (should be a real sentence)
  const MIN_LENGTH = 3;
  if (sanitized.length < MIN_LENGTH) {
    throw new Error('Sentence too short');
  }

  return sanitized;
}

/**
 * Validate that input looks like a French sentence
 * @param {string} input - The sanitized input
 * @returns {boolean} Whether it's valid
 */
export function validateFrenchSentence(input) {
  // Should contain at least some letters
  const hasLetters = /[a-zàâäæçéèêëïîôùûüÿœ]/i.test(input);
  
  // Shouldn't be just special characters
  const notOnlySpecial = !/^[^a-zàâäæçéèêëïîôùûüÿœ]+$/i.test(input);
  
  // Shouldn't contain excessive special characters
  const specialCharRatio = (input.match(/[^a-zàâäæçéèêëïîôùûüÿœ\s'-]/gi) || []).length / input.length;
  const notTooManySpecial = specialCharRatio < 0.3;

  return hasLetters && notOnlySpecial && notTooManySpecial;
}
