'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const diagnosis = searchParams.get('diagnosis');
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    // Set the current date and time
    const now = new Date();
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    setCurrentTime(now.toLocaleDateString(undefined, options));
  }, []);
  
  // Handle printing
  const handlePrint = () => {
    window.print();
  };  if (!diagnosis) {
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
        <div className={styles.error}>
          <h1>No diagnosis found</h1>
          <p>Please return to the diagnosis page and try again.</p>
          <a 
            href="/diagnose"
            className={styles.backButton}
          >
            Try Again
          </a>
        </div>
      </main>
    );
  }

  // Group content by sections for a better layout
  const sections = {
    conditions: [],
    remedies: [],
    attention: [],
    disclaimer: [],
    other: []
  };
  
  // Process the diagnosis text
  let currentSection = 'other';
  diagnosis.split('\n').forEach((line) => {
    if (line.includes('Possible Conditions')) {
      currentSection = 'conditions';
    } else if (line.includes('Home Remedies') || line.includes('First Aid')) {
      currentSection = 'remedies';
    } else if (line.includes('Medical Attention') || line.includes('Seek Medical')) {
      currentSection = 'attention';
    } else if (line.includes('Disclaimer')) {
      currentSection = 'disclaimer';
    }
    
    sections[currentSection].push(line);
  });  return (
    <main className={styles.main}>
      {/* Medical Icons as Background Animations */}
      <img src="/heart.svg" alt="" className={`${styles.medicalIcon} ${styles.heartbeat}`} />
      <img src="/stethoscope.svg" alt="" className={`${styles.medicalIcon} ${styles.stethoscope}`} />
      <img src="/pill-square.svg" alt="" className={`${styles.medicalIcon} ${styles.pill}`} />
      <img src="/ecg.svg" alt="" className={`${styles.medicalIcon} ${styles.ecg}`} />
      <img src="/medical-cross.svg" alt="" className={`${styles.medicalIcon} ${styles.medicalCross}`} />
      <img src="/bandage.svg" alt="" className={`${styles.medicalIcon} ${styles.bandage}`} />
      <img src="/health-warning.svg" alt="" className={`${styles.medicalIcon} ${styles.healthWarning}`} />
      <div className={styles.results}>        <header>
          <h1>My Wellness Doctor Results</h1>
          <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '-0.5rem' }}>
            Generated on {currentTime}
          </p>
        </header><div className={styles.content}>
          {/* Parse the diagnosis text and organize sections */}
          {(() => {
            // Split by section headers to properly organize content
            const lines = diagnosis.split('\n');
            const sections = [];
            let currentSection = { title: '', icon: '', content: [], type: '' };
            
            // Process each line
            lines.forEach((line, index) => {
              // Main header
              if (line.startsWith('##') && !line.startsWith('###')) {
                const headerText = line.replace('##', '').trim();
                if (index > 0 && currentSection.content.length > 0) {
                  sections.push({...currentSection});
                }
                currentSection = { 
                  title: headerText, 
                  icon: '',
                  content: [],
                  type: 'main'
                };
              } 
              // Section header
              else if (line.startsWith('###')) {
                const headerText = line.replace('###', '').trim();
                if (index > 0 && currentSection.content.length > 0) {
                  sections.push({...currentSection});
                }
                
                let icon = '';
                let type = '';
                
                // Assign icons based on section type
                if (headerText.includes('Possible Conditions')) {
                  icon = '🔍';
                  type = 'conditions';
                } else if (headerText.includes('Home Remedies') || headerText.includes('First Aid')) {
                  icon = '🏠';
                  type = 'remedies';
                } else if (headerText.includes('Medical Attention') || headerText.includes('Seek')) {
                  icon = '🚑';
                  type = 'attention';
                } else if (headerText.includes('Disclaimer')) {
                  icon = '⚠️';
                  type = 'disclaimer';
                }
                
                currentSection = { 
                  title: headerText, 
                  icon,
                  content: [],
                  type
                };
              } 
              // Content for the current section
              else {
                currentSection.content.push(line);
              }
            });
            
            // Add the last section
            if (currentSection.content.length > 0) {
              sections.push(currentSection);
            }
            
            // Render the organized sections
            return sections.map((section, sectionIndex) => {
              if (section.type === 'disclaimer') {
                return null; // We'll handle disclaimer separately
              }
              
              // Special styling for different section types
              const sectionStyle = {
                conditions: { borderTop: '4px solid #3498db' },
                remedies: { borderTop: '4px solid #27ae60' },
                attention: { borderTop: '4px solid #e74c3c' },
                main: { borderTop: 'none' },
              };
              
              return (
                <div key={sectionIndex} className={styles.section} style={sectionStyle[section.type] || {}}>
                  <h3>
                    {section.icon && <span style={{ marginRight: '10px' }}>{section.icon}</span>}
                    {section.title}
                  </h3>
                  <div>
                    {section.content.map((line, lineIndex) => {
                      // Format bullet points
                      if (line.startsWith('-')) {
                        return <li key={lineIndex} className={styles.bulletPoint}>{line.substring(1).trim()}</li>;
                      }
                      
                      // Format bold text
                      else if (line.includes('**')) {
                        const parts = [];
                        let lastIndex = 0;
                        let count = 0;
                        
                        // Find all bold text segments
                        const regex = /\*\*(.*?)\*\*/g;
                        let match;
                        
                        while ((match = regex.exec(line)) !== null) {
                          // Add text before the match
                          if (match.index > lastIndex) {
                            parts.push(
                              <span key={`${lineIndex}-${count++}`}>
                                {line.substring(lastIndex, match.index)}
                              </span>
                            );
                          }
                          
                          // Add the bold text
                          parts.push(
                            <strong key={`${lineIndex}-${count++}`} style={{ color: '#2c3e50' }}>
                              {match[1]}
                            </strong>
                          );
                          
                          lastIndex = match.index + match[0].length;
                        }
                        
                        // Add any remaining text
                        if (lastIndex < line.length) {
                          parts.push(
                            <span key={`${lineIndex}-${count++}`}>
                              {line.substring(lastIndex)}
                            </span>
                          );
                        }
                        
                        return <p key={lineIndex}>{parts}</p>;
                      }
                      
                      // Regular paragraph
                      else if (line.trim() !== '') {
                        return <p key={lineIndex}>{line}</p>;
                      }
                      
                      // Empty line
                      return <br key={lineIndex} />;
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
          <div className={styles.actions}>          <a 
            href="/diagnose"
            className={styles.newDiagnosisButton}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔍</span>
            New Diagnosis
          </a>          <a 
            href="/nearby-facilities"
            className={styles.findNearbyButton}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏥</span>
            Find Nearby Facilities
          </a>
          <button
            onClick={handlePrint}
            className={styles.printButton}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🖨️</span> Print Results
          </button>
          <a 
            href="/"
            className={styles.homeButton}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏠</span>
            Back to Home
          </a>
        </div>
          <div className={styles.disclaimer}>
          <p>
            <span style={{ fontSize: '1.2rem', marginRight: '8px', verticalAlign: 'middle' }}>⚠️</span>
            <strong style={{ color: '#e67e22' }}>Medical Disclaimer:</strong> This is an AI-generated response and should not be considered as professional medical advice. 
            If you are experiencing severe symptoms or are concerned about your health, 
            please consult with a qualified healthcare provider as soon as possible.
          </p>
        </div>
      </div>
    </main>
  );
}
