import fs from 'fs';
import path from 'path';
import { cleanCache } from '@/utils/cache';

// Cache location in the project
const CACHE_DIR = path.join(process.cwd(), '.cache');

export async function GET() {
  try {
    // Verify the cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      return Response.json({ status: 'No cache directory found' });
    }
    
    // Read cache stats
    const files = fs.readdirSync(CACHE_DIR);
    const cacheStats = {
      totalEntries: files.length,
      cacheSize: 0,
      oldestEntry: null,
      newestEntry: null,
      entries: []
    };
    
    // Collect detailed stats
    for (const file of files) {
      if (file.endsWith('.json')) {
        const cacheFilePath = path.join(CACHE_DIR, file);
        try {
          const stats = fs.statSync(cacheFilePath);
          const fileSize = stats.size;
          cacheStats.cacheSize += fileSize;
          
          const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
          const timestamp = cacheData.timestamp || 0;
          const date = new Date(timestamp);
          const age = Date.now() - timestamp;
          
          // Track oldest and newest
          if (!cacheStats.oldestEntry || timestamp < cacheStats.oldestEntry.timestamp) {
            cacheStats.oldestEntry = { date: date.toISOString(), age: Math.floor(age / 1000) };
          }
          
          if (!cacheStats.newestEntry || timestamp > cacheStats.newestEntry.timestamp) {
            cacheStats.newestEntry = { date: date.toISOString(), age: Math.floor(age / 1000) };
          }
          
          cacheStats.entries.push({
            key: file.replace('.json', ''),
            size: fileSize,
            date: date.toISOString(),
            preview: cacheData.key_preview || 'No preview'
          });
        } catch (error) {
          console.error('Error reading cache file stats:', error);
        }
      }
    }
    
    // Convert cache size to kilobytes
    cacheStats.cacheSize = Math.round(cacheStats.cacheSize / 1024);
    
    return Response.json({ status: 'success', stats: cacheStats });
  } catch (error) {
    console.error('Cache stats error:', error);
    return Response.json({ status: 'error', message: error.message });
  }
}

export async function DELETE() {
  try {
    const removed = await cleanCache();
    return Response.json({ status: 'success', cleaned: removed });
  } catch (error) {
    console.error('Cache cleaning error:', error);
    return Response.json({ status: 'error', message: error.message });
  }
}
