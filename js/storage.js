const STORAGE_KEYS = {
  apiKey:    'stratus_api_key',
  prefs:     'stratus_prefs',
  favorites: 'stratus_favorites',
};

/**
 * Save any value to localStorage under the given key.
 * @param {string} key
 * @param {*} value  - will be JSON-stringified
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('localStorage write failed:', err);
  }
}

/**
 * Load and JSON-parse a value from localStorage.
 * Returns `fallback` if the key is missing or data is corrupt.
 * @param {string} key
 * @param {*} fallback - returned when key is absent or unreadable
 * @returns {*}
 */
function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn('localStorage read failed:', err);
    return fallback;
  }
}

/**
 * Remove a key from localStorage.
 * @param {string} key
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('localStorage remove failed:', err);
  }
}
