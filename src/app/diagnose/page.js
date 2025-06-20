'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function DiagnosePage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [commonSymptoms, setCommonSymptoms] = useState({});
  const [showSymptomCategories, setShowSymptomCategories] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.target);
    const symptomsText = formData.get('symptoms');
    
    // Get all checked symptoms
    const selectedSymptoms = Object.entries(commonSymptoms)
      .filter(([_, isSelected]) => isSelected)
      .map(([name, _]) => name);
      
    // Create a combined symptoms string with both text and checkboxes
    const combinedSymptoms = `
${symptomsText}

Selected symptoms:
${selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None selected'}
    `.trim();

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: combinedSymptoms }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get diagnosis');
      }

      if (data.diagnosis) {
        window.location.href = `/results?diagnosis=${encodeURIComponent(data.diagnosis)}`;
      } else {
        setError('No diagnosis received');
      }    } catch (err) {
      console.error('Diagnosis Error:', err);
      
      // Provide more user-friendly error messages
      if (err.message.includes('API') || err.message.includes('request failed')) {
        setError('Could not connect to the AI service. Using fallback system instead.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }
  
  // Toggle symptom selection
  const handleSymptomToggle = (symptom) => {
    setCommonSymptoms(prev => ({
      ...prev,
      [symptom]: !prev[symptom]
    }));
  };

  // Toggle visibility of symptom categories
  const toggleSymptomCategories = () => {
    setShowSymptomCategories(!showSymptomCategories);
  };

  // Symptom categories with common symptoms for each
  const symptomCategories = {
    "General": [
      "Fever", "Fatigue", "Weakness", "Weight loss", "Weight gain", "Night sweats",
      "Chills", "Body aches", "Loss of appetite", "Increased appetite"
    ],
    "Head & Neurological": [
      "Headache", "Dizziness", "Confusion", "Memory issues", "Fainting",
      "Seizures", "Tremor", "Numbness", "Tingling", "Balance problems"
    ],
    "Respiratory": [
      "Cough", "Shortness of breath", "Wheezing", "Chest tightness", "Chest pain", 
      "Runny nose", "Stuffy nose", "Sneezing", "Sore throat", "Hoarseness"
    ],
    "Digestive": [
      "Nausea", "Vomiting", "Diarrhea", "Constipation", "Bloating", "Abdominal pain",
      "Heartburn", "Indigestion", "Black stool", "Bloody stool", "Increased thirst"
    ],
    "Musculoskeletal": [
      "Joint pain", "Muscle pain", "Swelling", "Stiffness", "Back pain", 
      "Neck pain", "Mobility issues", "Muscle weakness"
    ],
    "Skin": [
      "Rash", "Itching", "Hives", "Dry skin", "Excessive sweating", "Skin color changes",
      "Bruising", "Unusual moles", "Hair loss", "Nail changes"
    ],
    "Mental Health": [
      "Anxiety", "Depression", "Mood changes", "Sleep problems", "Irritability",
      "Stress", "Concentration issues", "Hallucinations"
    ]
  };
  
  return (
    <main className={styles.main}>
      {/* Medical Icons as Floating Animations */}
      <svg className={`${styles.medicalIcon} ${styles.heartbeat}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <svg className={`${styles.medicalIcon} ${styles.stethoscope}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M19 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 1.3.84 2.4 2 2.82V11c0 2.21-1.79 4-4 4s-4-1.79-4-4V9.29c.38-.08.7-.29.93-.56.23-.26.37-.6.37-.95 0-.83-.67-1.5-1.5-1.5S8.3 6.95 8.3 7.78c0 .35.13.7.37.95.23.27.55.48.93.56V11c0 3.31 2.69 6 6 6s6-2.69 6-6v-2.18c1.16-.42 2-1.52 2-2.82zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM5 20.5A1.5 1.5 0 0 0 6.5 22H8v-1.5H6.5v-2H8V17H6.5A1.5 1.5 0 0 0 5 18.5v2z"/>
      </svg>
      <svg className={`${styles.medicalIcon} ${styles.pill}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-6.2 14.1l-5.9-5.9c-1.1-1.1-1.1-2.8 0-3.8 1.1-1.1 2.8-1.1 3.8 0l5.9 5.9c1.1 1.1 1.1 2.8 0 3.8-1.1 1.1-2.8 1.1-3.8 0z"/>
      </svg>
      <svg className={`${styles.medicalIcon} ${styles.dna}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M4 2h16v2H4V2zm0 4h16v2H4V6zm9 8H4v-2h9v2zm7 0h-5v-2h5v2zm-7 4H4v-2h9v2zm7 0h-5v-2h5v2zM4 22h16v-2H4v2zm9-14H4V6h9v2zm7 0h-5V6h5v2z"/>
      </svg>
      <svg className={`${styles.medicalIcon} ${styles.microscope}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5.5-4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7-5c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7z"/>
      </svg>
      <svg className={`${styles.medicalIcon} ${styles.bandage}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M17.73 12.02l3.98-3.98a.996.996 0 0 0 0-1.41l-4.34-4.34a.996.996 0 0 0-1.41 0l-3.98 3.98L8 2.29a1.001 1.001 0 0 0-1.41 0L2.25 6.63a.996.996 0 0 0 0 1.41l3.98 3.98L2.25 16a.996.996 0 0 0 0 1.41l4.34 4.34c.39.39 1.03.39 1.42 0l3.98-3.98 3.98 3.98c.2.2.45.29.71.29.26 0 .51-.1.71-.29l4.34-4.34a.996.996 0 0 0 0-1.41l-3.99-3.98zM12 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4.71 1.96L3.66 7.34l3.63-3.63 3.62 3.62-3.62 3.63zM10 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2.66 9.34l-3.63-3.62 3.63-3.63 3.62 3.62-3.62 3.63z"/>
      </svg>
        {/* Page Title - Always visible */}
      <h2 className={styles.pageTitle}>My Wellness Doctor</h2>
      
      <div className={styles.formContainer}>
        {/* Disclaimer - Now with improved positioning and spacing */}
        <div className={styles.disclaimer}>
          <strong>Medical Disclaimer:</strong> This tool provides informational purposes only, not professional medical advice.
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.decorativeIcon + ' ' + styles.iconTopRight}>+</div>
          <div className={styles.decorativeIcon + ' ' + styles.iconBottomLeft}>❤</div>
            <h1>Describe Your Symptoms</h1>
          <p>Please provide a detailed description of your symptoms, their duration, and any relevant medical history to receive the most accurate analysis.</p>
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          
          <button 
            type="button" 
            onClick={toggleSymptomCategories}
            className={styles.toggleSymptomsButton}
          >
            {showSymptomCategories ? 'Hide Symptom Checklist' : 'Show Symptom Checklist'} 
            <span className={styles.toggleIcon}>{showSymptomCategories ? '▲' : '▼'}</span>
          </button>
          
          {showSymptomCategories && (
            <div className={styles.symptomCategoriesContainer}>
              <p className={styles.checkboxHelper}>Select any symptoms you're experiencing:</p>
              
              {Object.entries(symptomCategories).map(([category, symptoms]) => (
                <div key={category} className={styles.symptomCategory}>
                  <h3>{category}</h3>
                  <div className={styles.symptomsGrid}>
                    {symptoms.map(symptom => (
                      <div key={symptom} className={styles.symptomCheckbox}>
                        <input
                          type="checkbox"
                          id={`symptom-${symptom.replace(/\s+/g, '-').toLowerCase()}`}
                          checked={!!commonSymptoms[symptom]}
                          onChange={() => handleSymptomToggle(symptom)}
                          disabled={loading}
                        />
                        <label htmlFor={`symptom-${symptom.replace(/\s+/g, '-').toLowerCase()}`}>
                          {symptom}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className={styles.textareaContainer}>
            <textarea
              name="symptoms"
              placeholder="Example: I've had a sore throat for 3 days, along with fever (101°F) and persistent headache. I also feel unusually tired and have mild body aches. No cough or nasal congestion. I have no known allergies and take no regular medications..."
              rows={7}
              className={styles.textarea}
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.buttonsContainer}>            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Analyzing Symptoms...' : 'Get Medical Insight'}
            </button>
            
            <a 
              href="/"
              className={styles.backButton}
              onClick={loading ? (e) => e.preventDefault() : undefined}
            >
              Back to Home
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
