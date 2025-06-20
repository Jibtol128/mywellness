'use client';

import { useState, useEffect } from 'react';
import styles from './cache-status.module.css';

export default function CacheStatus() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch cache stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cache');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clean cache
  const cleanCache = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/cache', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clean cache: ${response.status}`);
      }
      
      const data = await response.json();
      alert(`Cache cleaned successfully. Removed ${data.cleaned} expired entries.`);
      fetchStats(); // Refresh stats
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Load stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2>Cache Status</h2>
        <p className={styles.loading}>Loading cache statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2>Cache Status</h2>
        <p className={styles.error}>Error: {error}</p>
        <button onClick={fetchStats} className={styles.button}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Diagnosis Cache Status</h2>
      
      {stats ? (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span>Cached Entries:</span>
            <strong>{stats.totalEntries}</strong>
          </div>
          <div className={styles.stat}>
            <span>Total Size:</span>
            <strong>{stats.cacheSize} KB</strong>
          </div>
          {stats.oldestEntry && (
            <div className={styles.stat}>
              <span>Oldest Entry:</span>
              <strong>{new Date(stats.oldestEntry.date).toLocaleString()}</strong>
              <small>({Math.floor(stats.oldestEntry.age / 60)} minutes ago)</small>
            </div>
          )}
          {stats.newestEntry && (
            <div className={styles.stat}>
              <span>Newest Entry:</span>
              <strong>{new Date(stats.newestEntry.date).toLocaleString()}</strong>
              <small>({Math.floor(stats.newestEntry.age / 60)} minutes ago)</small>
            </div>
          )}
        </div>
      ) : (
        <p>No cache data available</p>
      )}
      
      <div className={styles.actions}>
        <button 
          onClick={fetchStats} 
          className={styles.button} 
          disabled={refreshing}>
          Refresh Stats
        </button>
        <button 
          onClick={cleanCache} 
          className={styles.buttonWarning}
          disabled={refreshing}>
          Clean Expired Cache
        </button>
      </div>
      
      {stats && stats.entries && stats.entries.length > 0 && (
        <div className={styles.entries}>
          <h3>Recent Cache Entries</h3>
          <ul>
            {stats.entries.slice(0, 5).map((entry, index) => (
              <li key={index}>
                <div className={styles.entry}>
                  <div className={styles.entryPreview}>
                    {entry.preview}
                  </div>
                  <div className={styles.entryMeta}>
                    <small>{new Date(entry.date).toLocaleString()}</small>
                    <small>{Math.round(entry.size / 1024)} KB</small>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
