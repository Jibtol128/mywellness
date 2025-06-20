'use client';

import { useState } from 'react';
import Link from 'next/link';
import CacheStatus from '@/components/cache-status';
import styles from './page.module.css';

export default function AdminPage() {
  const [showAccessForm, setShowAccessForm] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
    // Simple admin access verification
  const verifyAccess = (e) => {
    e.preventDefault();
    // Simple code for demo purposes - in a real app, use proper authentication
    if (accessCode === 'wellness2025') {
      setShowAccessForm(false);
      setError('');
    } else {
      setError('Invalid access code');
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>My Wellness Doctor Admin</h1>
        
        {showAccessForm ? (
          <div className={styles.accessForm}>
            <p>Enter the admin access code to continue:</p>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={verifyAccess}>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Access Code"
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Submit
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className={styles.adminNav}>
              <Link href="/" className={styles.backLink}>
                ← Back to Home
              </Link>
            </div>
            
            <section className={styles.section}>
              <h2>System Status</h2>
              <div className={styles.stat}>
                <span>API Status:</span>
                <span className={styles.active}>Active</span>
              </div>
            </section>
            
            <section className={styles.section}>
              <CacheStatus />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
