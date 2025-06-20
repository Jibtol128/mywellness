import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Medical Icons as Background Animations */}
      <img src="/heart.svg" alt="" className={`${styles.medicalIcon} ${styles.heartbeat}`} />
      <img src="/stethoscope.svg" alt="" className={`${styles.medicalIcon} ${styles.stethoscope}`} />
      <img src="/pill-square.svg" alt="" className={`${styles.medicalIcon} ${styles.pill}`} />
      <img src="/ecg.svg" alt="" className={`${styles.medicalIcon} ${styles.ecg}`} />
      <img src="/medical-cross.svg" alt="" className={`${styles.medicalIcon} ${styles.medicalCross}`} />
      <img src="/bandage.svg" alt="" className={`${styles.medicalIcon} ${styles.bandage}`} />
      <img src="/health-warning.svg" alt="" className={`${styles.medicalIcon} ${styles.healthWarning}`} />

      <div className={styles.contentWrapper}>
        <div className={styles.hero}>
          <h1>Welcome to My Wellness Doctor</h1>
          <p>Get instant AI-powered health insights based on your symptoms</p>
          <a href="/diagnose" className={styles.startButton}>
            <span>Start Diagnosis</span>
            <div className={styles.buttonShine}></div>
          </a>
        </div>
        <div className={styles.disclaimer}>
          <p>
            <span className={styles.disclaimerIcon}>⚠️</span> 
            <span className={styles.disclaimerText}>
              This is not a substitute for professional medical advice. 
              In case of emergency, please contact your healthcare provider or emergency services immediately.
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
