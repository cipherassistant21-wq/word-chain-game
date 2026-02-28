/**
 * Wikipedia API Utilities
 * Validates brands using Wikipedia API when not found in local database
 */

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

/**
 * Validates if a brand/product exists on Wikipedia
 * @param {string} brand - The brand name to validate
 * @returns {Promise<{valid: boolean, exists: boolean, title: string|null, error: string|null}>}
 */
export async function validateBrandWithWikipedia(brand) {
  if (!brand || typeof brand !== 'string') {
    return { valid: false, exists: false, title: null, error: 'Invalid brand name' };
  }

  const searchTerm = brand.trim();

  try {
    // Use Wikipedia API to search for the brand
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: searchTerm,
      format: 'json',
      origin: '*',
      srlimit: '5'
    });

    const response = await fetch(`${WIKIPEDIA_API_URL}?${params}`);

    if (!response.ok) {
      return { valid: false, exists: false, title: null, error: 'Wikipedia API request failed' };
    }

    const data = await response.json();

    if (!data.query || !data.query.search) {
      return { valid: false, exists: false, title: null, error: 'No results found' };
    }

    const searchResults = data.query.search;

    // Check for exact or close match in results
    for (const result of searchResults) {
      const resultTitle = result.title.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      // Exact match
      if (resultTitle === searchLower) {
        return { valid: true, exists: true, title: result.title, error: null };
      }

      // Contains match (brand name is part of the article title)
      if (resultTitle.includes(searchLower) || searchLower.includes(resultTitle)) {
        return { valid: true, exists: true, title: result.title, error: null };
      }
    }

    // No matching result found
    return { valid: false, exists: false, title: null, error: null };
  } catch (error) {
    console.error('Wikipedia validation error:', error);
    return { valid: false, exists: false, title: null, error: 'Network error' };
  }
}

export default {
  validateBrandWithWikipedia
};
