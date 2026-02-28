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
 * Calculates the Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} The edit distance between the two strings
 */
export function levenshteinDistance(a, b) {
  if (!a || !b) {
    return a ? a.length : (b ? b.length : 0);
  }

  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= bLower.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLower.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the matrix
  for (let i = 1; i <= bLower.length; i++) {
    for (let j = 1; j <= aLower.length; j++) {
      if (bLower.charAt(i - 1) === aLower.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bLower.length][aLower.length];
}

/**
 * Finds a brand with fuzzy matching
 * @param {string} word - The word to search for
 * @param {Array<string|Object>} brands - Array of brand strings or objects with 'name' property
 * @param {number} maxDistance - Maximum Levenshtein distance for fuzzy match (default: 2)
 * @returns {{ brand: string|Object|null, confidence: 'exact'|'fuzzy'|'none', distance?: number }}
 */
export function findBrandFuzzy(word, brands, maxDistance = 2) {
  if (!word || !Array.isArray(brands)) {
    return { brand: null, confidence: 'none' };
  }

  const searchTerm = word.trim();

  // First try exact match
  const exactMatch = findBrand(searchTerm, brands);
  if (exactMatch) {
    return { brand: exactMatch, confidence: 'exact' };
  }

  // Then try fuzzy match with proportional distance allowance
  const searchLength = searchTerm.length;
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const brand of brands) {
    const brandName = typeof brand === 'string' ? brand : brand?.name;
    if (!brandName) continue;

    // Calculate proportional max distance based on word length
    // Allow 1 edit for short words, 2 for medium, 3+ for longer words
    const proportionalMax = Math.min(
      maxDistance,
      Math.max(1, Math.floor(searchLength * 0.4)) // Allow up to 40% of length as edits
    );

    const distance = levenshteinDistance(searchTerm, brandName);

    if (distance <= proportionalMax && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = brand;
    }
  }

  if (bestMatch) {
    return { brand: bestMatch, confidence: 'fuzzy', distance: bestDistance };
  }

  return { brand: null, confidence: 'none' };
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

import { validateBrandWithWikipedia } from './wikipediaApi.js';

/**
 * Validates a brand word against all game rules
 * @param {string} word - The word to validate
 * @param {Array<string|Object>} brands - Array of available brands
 * @param {string} lastWord - The previous word (optional, for first turn)
 * @returns {{ valid: boolean, error: string|null, brand: string|null, suggestion?: string|null }}
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

  // Check if brand exists using fuzzy matching
  const fuzzyResult = findBrandFuzzy(trimmedWord, brands);

  if (fuzzyResult.confidence === 'none') {
    return {
      valid: false,
      error: `"${trimmedWord}" is not a recognized brand`,
      brand: null,
      suggestion: null
    };
  }

  if (fuzzyResult.confidence === 'fuzzy') {
    const suggestedBrand = typeof fuzzyResult.brand === 'string'
      ? fuzzyResult.brand
      : fuzzyResult.brand?.name;

    return {
      valid: false,
      error: `Did you mean "${suggestedBrand}"?`,
      brand: null,
      suggestion: suggestedBrand
    };
  }

  // Exact match found
  const foundBrand = fuzzyResult.brand;

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

/**
 * Async version of isBrandValid that validates against Wikipedia if not found in database
 * @param {string} word - The word to validate
 * @param {Array<string|Object>} brands - Array of available brands
 * @param {string} lastWord - The previous word (optional, for first turn)
 * @returns {Promise<{ valid: boolean, error: string|null, brand: string|null, suggestion?: string|null, source?: 'database'|'wikipedia' }>}
 */
export async function isBrandValidAsync(word, brands, lastWord = null) {
  // First check local database
  const dbValidation = isBrandValid(word, brands, lastWord);

  if (dbValidation.valid) {
    return {
      ...dbValidation,
      source: 'database'
    };
  }

  // If not found in database, try Wikipedia validation
  if (dbValidation.error && dbValidation.error.includes('not a recognized brand')) {
    const trimmedWord = word.trim();

    const wikiResult = await validateBrandWithWikipedia(trimmedWord);

    if (wikiResult.valid) {
      // Check letter sequence rule
      if (lastWord && lastWord.trim().length > 0) {
        if (!startsWithCorrectLetter(trimmedWord, lastWord)) {
          const requiredLetter = getLastLetter(lastWord);
          return {
            valid: false,
            error: `Word must start with "${requiredLetter.toUpperCase()}"`,
            brand: null,
            source: 'wikipedia'
          };
        }
      }

      // Use the Wikipedia title as the brand name
      return {
        valid: true,
        error: null,
        brand: wikiResult.title,
        source: 'wikipedia'
      };
    }
  }

  // Return original database validation result
  return {
    ...dbValidation,
    source: 'database'
  };
}

export default {
  getLastLetter,
  startsWithCorrectLetter,
  levenshteinDistance,
  findBrandFuzzy,
  findBrand,
  isBrandValid,
  isBrandValidAsync
};
