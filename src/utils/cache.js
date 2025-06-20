import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Cache location in the project
const CACHE_DIR = path.join(process.cwd(), '.cache');
// Cache expiration in milliseconds (default: 24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; 

/**
 * Initialize the cache directory if it doesn't exist
 */
function initCache() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      console.log('Cache directory created at:', CACHE_DIR);
    }
  } catch (error) {
    console.error('Failed to initialize cache directory:', error);
  }
}

/**
 * Generate a consistent hash key for the input
 * @param {string} input - The input to hash (e.g., symptoms text)
 * @returns {string} A hex hash of the input
 */
function generateCacheKey(input) {
  return crypto
    .createHash('md5')
    .update(input.trim().toLowerCase())
    .digest('hex');
}

/**
 * Get cached data if it exists and is not expired
 * @param {string} key - The cache key
 * @returns {Promise<any|null>} The cached data or null if not found/expired
 */
export async function getFromCache(key) {
  initCache();
  
  const cacheKey = generateCacheKey(key);
  const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    if (fs.existsSync(cacheFilePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      
      // Check if cache is expired
      if (cacheData.timestamp && Date.now() - cacheData.timestamp < CACHE_EXPIRATION) {
        console.log('Cache hit for key:', key.substring(0, 20) + '...');
        return cacheData.data;
      } else {
        console.log('Cache expired for key:', key.substring(0, 20) + '...');
        // Delete expired cache file
        try {
          fs.unlinkSync(cacheFilePath);
        } catch (deleteError) {
          console.error('Error deleting expired cache:', deleteError);
        }
      }
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }
  
  return null;
}

/**
 * Save data to the cache
 * @param {string} key - The cache key
 * @param {any} data - The data to cache
 * @returns {Promise<boolean>} Success status
 */
export async function saveToCache(key, data) {
  initCache();
  
  const cacheKey = generateCacheKey(key);
  const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    const cacheData = {
      timestamp: Date.now(),
      data: data,
      key_preview: key.substring(0, 50) // Store preview of original key for debugging
    };
    
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf8');
    console.log('Saved to cache with key:', key.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('Error writing to cache:', error);
    return false;
  }
}

/**
 * Clean expired cache entries
 * @returns {Promise<number>} Number of removed entries
 */
export async function cleanCache() {
  initCache();
  
  let removed = 0;
  try {
    const files = fs.readdirSync(CACHE_DIR);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const cacheFilePath = path.join(CACHE_DIR, file);
        try {
          const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
          
          // Delete if expired
          if (cacheData.timestamp && Date.now() - cacheData.timestamp >= CACHE_EXPIRATION) {
            fs.unlinkSync(cacheFilePath);
            removed++;
          }
        } catch (error) {
          // If file is corrupt, remove it
          try {
            fs.unlinkSync(cacheFilePath);
            removed++;
          } catch (e) {
            console.error('Error removing corrupt cache file:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
  
  return removed;
}
