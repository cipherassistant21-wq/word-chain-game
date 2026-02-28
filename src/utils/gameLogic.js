/**
 * Game Logic Utilities
 * Pure functions for word chain game validation
 */

/**
 * Gets the last letter of a word after stripping trailing whitespace/punctuation
 * @param {string} word - The word to process
 * @returns {string} The last character in lowercase, or empty string for empty input
 */
export function getLastLetter(word) {
  if (!word || typeof word !== 'string') {
    return '';
  }
  
  // Remove trailing whitespace and punctuation
  const cleaned = word.trim().replace(/[^\w\s]/g, '').trim();
  
  if (cleaned.length === 0) {
    return '';
  }
  
  return cleaned.charAt(cleaned.length - 1).toLowerCase();
}

/**
 * Checks if a word starts with the correct letter (last letter of previous word)
 * @param {string} word - The word to check
 * @param {string} lastWord - The previous word (can be empty/null for first turn)
 * @returns {boolean} True if word starts with correct letter, or if lastWord is empty
 */
export function startsWithCorrectLetter(word, lastWord) {
  // First word can start with anything
  if (!lastWord || lastWord.trim().length === 0) {
    return true;
  }
  
  if (!word || typeof word !== 'string') {
    return false;
  }
  
  const requiredLetter = getLastLetter(lastWord);
  const wordStartLetter = word.trim().charAt(0).toLowerCase();
  
  return wordStartLetter === requiredLetter;
}

/**
 * Finds a brand in the brands array (case insensitive)
 * @param {string} word - The word to search for
 * @param {Array<string|Object>} brands - Array of brand strings or objects with 'name' property
 * @returns {string|Object|null} The matching brand (original form), or null if not found
 */
export function findBrand(word, brands) {
  if (!word || !Array.isArray(brands)) {
    return null;
  }
  
  const searchTerm = word.trim().toLowerCase();
  
  for (const brand of brands) {
    // Handle both string brands and object brands with 'name' property
    const brandName = typeof brand === 'string' ? brand : brand?.name;
    
    if (brandName && brandName.toLowerCase() === searchTerm) {
      return brand; // Return original form (string or object)
    }
  }
  
  return null;
}

/**
 * Validates a brand word against all game rules
 * @param {string} word - The word to validate
 * @param {Array<string|Object>} brands - Array of available brands
 * @param {string} lastWord - The previous word (optional, for first turn)
 * @returns {{ valid: boolean, error: string|null, brand: string|null }}
 */
export function isBrandValid(word, brands, lastWord = null) {
  // Check for empty word
  if (!word || word.trim().length === 0) {
    return {
      valid: false,
      error: 'Please enter a word',
      brand: null
    };
  }
  
  const trimmedWord = word.trim();
  
  // Check if brand exists in the list
  const foundBrand = findBrand(trimmedWord, brands);
  
  if (!foundBrand) {
    return {
      valid: false,
      error: `"${trimmedWord}" is not a recognized brand`,
      brand: null
    };
  }
  
  // Check letter sequence rule
  if (lastWord && lastWord.trim().length > 0) {
    if (!startsWithCorrectLetter(trimmedWord, lastWord)) {
      const requiredLetter = getLastLetter(lastWord);
      return {
        valid: false,
        error: `Word must start with "${requiredLetter.toUpperCase()}"`,
        brand: null
      };
    }
  }
  
  // Get brand name for response
  const brandName = typeof foundBrand === 'string' ? foundBrand : foundBrand.name;
  
  return {
    valid: true,
    error: null,
    brand: brandName
  };
}

export default {
  getLastLetter,
  startsWithCorrectLetter,
  findBrand,
  isBrandValid
};
