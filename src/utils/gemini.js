// Simplified API implementation that doesn't rely on the Google SDK
import { getFromCache, saveToCache } from './cache';

// Simplified API implementation with caching
export async function getGeminiDiagnosis(symptoms) {
  console.log('Processing diagnosis request for symptoms:', symptoms);
  
  // Normalize symptoms for better cache hits (trim whitespace, lowercase)
  const normalizedSymptoms = symptoms.trim().toLowerCase();
  
  try {
    // Check cache first before making API call
    const cachedResult = await getFromCache(normalizedSymptoms);
    
    if (cachedResult) {
      console.log('Retrieved diagnosis from cache, length:', cachedResult.length);
      return cachedResult;
    }
    
    console.log('No cache hit. Making direct API call to Gemini with symptoms:', symptoms);
    
    // Get API key from server environment variable (not client-side)
    const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('No API key found in environment variables');
      throw new Error('Gemini API key not configured');
    }
    
    console.log('API key available:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));
    
    // Use one of the available models from the API
    const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
    
    const prompt = `As a medical AI assistant, analyze these symptoms: ${symptoms}. 
    Please provide a structured response with:
    1. Possible conditions
    2. Home remedies and first aid suggestions
    3. Clear indicators for when to seek immediate medical attention
    
    Format the response in a clear, easy-to-read manner with markdown headings and bullet points.`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    };
    
    console.log('Sending request to Gemini API with URL:', apiUrl);
    console.log('Request body sample:', JSON.stringify(requestBody).substring(0, 100) + '...');
    
    const fetchUrl = `${apiUrl}?key=${apiKey}`;
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    };
    
    // Trying the fetch with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(fetchUrl, { 
        ...fetchOptions, 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      console.log('Response received with status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('API error details:', JSON.stringify(errorData, null, 2));
          if (errorData.error) {
            errorMessage += ` - ${errorData.error.message || 'Unknown error'}`;
          }
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Response received successfully, parsing data...');
      
      if (!data.candidates || data.candidates.length === 0) {
        console.error('No candidates in response:', JSON.stringify(data));
        throw new Error('No response candidates received from API');
      }
      
      if (!data.candidates[0].content || !data.candidates[0].content.parts || 
          data.candidates[0].content.parts.length === 0) {
        console.error('Invalid content structure:', JSON.stringify(data.candidates[0]));
        throw new Error('Invalid API response format');
      }
      
      const diagnosisText = data.candidates[0].content.parts[0].text;
      console.log('Successfully generated diagnosis, length:', diagnosisText.length);
      
      // Cache the result for future use
      await saveToCache(normalizedSymptoms, diagnosisText);
      
      return diagnosisText;

    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Fetch request timed out after 15 seconds');
        throw new Error('API request timed out');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in Gemini API call:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Main diagnosis function with caching and fallback
export async function getDiagnosis(symptoms) {
  try {
    // Try to get diagnosis from API (will check cache first)
    return await getGeminiDiagnosis(symptoms);
  } catch (error) {
    console.warn('API call failed, falling back to mock diagnosis:', error.message);
    
    // Fall back to mock function if API fails
    console.log('Creating mock diagnosis as fallback for symptoms:', symptoms);
    
    // Wait to simulate API call (shorter wait since we already tried the real API)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Normalize the symptoms text for better pattern matching
    const symptomsLower = symptoms.toLowerCase();
    
    // Create a personalized diagnosis based on symptoms mentioned
    let diagnosis = `## Based on your symptoms\n\n`;
    
    // Common symptom patterns to look for
    const hasHeadache = symptomsLower.includes('headache');
    const hasFever = symptomsLower.includes('fever') || symptomsLower.includes('temperature');
    const hasCough = symptomsLower.includes('cough');
    const hasSoreThroat = symptomsLower.includes('sore throat') || symptomsLower.includes('throat pain');
    const hasStomachPain = symptomsLower.includes('stomach') || symptomsLower.includes('abdomen');
    const hasNausea = symptomsLower.includes('nausea') || symptomsLower.includes('vomit');
    const hasDiarrhea = symptomsLower.includes('diarrhea') || symptomsLower.includes('loose stool');
    const isTired = symptomsLower.includes('tired') || symptomsLower.includes('fatigue') || symptomsLower.includes('exhausted');
    const hasChestPain = symptomsLower.includes('chest pain') || symptomsLower.includes('chest discomfort');
    const hasDizziness = symptomsLower.includes('dizzy') || symptomsLower.includes('dizziness') || symptomsLower.includes('lightheaded');
    const hasRunnyNose = symptomsLower.includes('runny nose') || symptomsLower.includes('nasal');
    const hasJointPain = symptomsLower.includes('joint') || symptomsLower.includes('arthritis');
    const hasRash = symptomsLower.includes('rash') || symptomsLower.includes('skin') || symptomsLower.includes('itchy');
    const hasBleedingIssue = symptomsLower.includes('blood') || symptomsLower.includes('bleeding');
    
    // Add possible conditions section
    diagnosis += '### Possible Conditions\n\n';
    
    let conditionsFound = false;
    
    // Respiratory conditions
    if (hasCough && hasFever) {
      diagnosis += '- **Common Cold or Flu**: Your symptoms of cough and fever are consistent with viral respiratory infections. These typically last 7-10 days and symptoms gradually improve with rest and hydration.\n';
      conditionsFound = true;
    }
    
    if (hasCough && hasRunnyNose && !hasFever) {
      diagnosis += '- **Allergies or Common Cold**: Cough with nasal congestion but without fever might indicate allergies or a mild cold virus.\n';
      conditionsFound = true;
    }
    
    // Throat conditions
    if (hasFever && hasSoreThroat) {
      diagnosis += '- **Strep Throat or Tonsillitis**: Fever with sore throat could indicate a bacterial infection like strep throat or inflammation of the tonsils.\n';
      conditionsFound = true;
    }
    
    // Headache conditions
    if (hasHeadache && hasFever) {
      diagnosis += '- **Viral Infection**: Headache with fever is commonly seen in various viral infections, including influenza.\n';
      conditionsFound = true;
    }
    
    if (hasHeadache && !hasFever && symptomsLower.includes('light') && symptomsLower.includes('sound')) {
      diagnosis += '- **Migraine**: Your headache with sensitivity to light and sound is consistent with migraine headaches.\n';
      conditionsFound = true;
    }
    
    // Gastrointestinal conditions
    if (hasStomachPain && hasNausea) {
      diagnosis += '- **Gastroenteritis**: Stomach discomfort with nausea suggests inflammation of the digestive tract, commonly known as stomach flu.\n';
      conditionsFound = true;
    }
    
    if (hasStomachPain && hasDiarrhea) {
      diagnosis += '- **Food Poisoning or Gastroenteritis**: Stomach pain with diarrhea could indicate either food poisoning or a gastrointestinal virus.\n';
      conditionsFound = true;
    }
    
    // Cardiovascular conditions
    if (hasChestPain) {
      diagnosis += '- **Multiple Possibilities** (requires medical attention): Chest pain could indicate various conditions from muscle strain to more serious cardiovascular issues. This requires prompt medical evaluation.\n';
      conditionsFound = true;
    }
    
    // General conditions
    if (isTired && !hasFever && !hasRunnyNose && !hasCough) {
      diagnosis += '- **Fatigue**: Could be due to stress, poor sleep, or other underlying conditions like anemia or depression.\n';
      conditionsFound = true;
    }
    
    if (hasJointPain && !hasFever) {
      diagnosis += '- **Arthritis or Strain**: Joint pain without fever might indicate arthritis, overuse injury, or strain.\n';
      conditionsFound = true;
    }
    
    if (hasRash) {
      diagnosis += '- **Skin Condition**: Your skin symptoms could indicate allergic reactions, eczema, or other dermatological conditions.\n';
      conditionsFound = true;
    }
    
    // If no specific patterns matched, provide a generic response
    if (!conditionsFound) {
      diagnosis += '- Based on the symptoms provided, there could be several possibilities. More specific medical assessment may be needed for an accurate diagnosis.\n';
    }
    
    // Add home remedies section
    diagnosis += '\n### Home Remedies and First Aid Suggestions\n\n';
    
    if (hasFever) {
      diagnosis += '- **For Fever**: Rest, stay hydrated, and take acetaminophen (Tylenol) or ibuprofen (Advil) as directed for fever reduction. Use a light blanket if you have chills.\n';
    }
    
    if (hasCough) {
      diagnosis += '- **For Cough**: Stay hydrated, use honey (if over 1 year old), try a humidifier at night, and consider cough drops to soothe irritation. Elevate your head while sleeping.\n';
    }
    
    if (hasSoreThroat) {
      diagnosis += '- **For Sore Throat**: Gargle with warm salt water (1/4 to 1/2 teaspoon of salt in 8oz water), use throat lozenges, drink warm tea with honey, and stay hydrated.\n';
    }
    
    if (hasHeadache) {
      diagnosis += '- **For Headache**: Rest in a dark, quiet room, apply cold or warm compresses, practice relaxation techniques, and consider over-the-counter pain relievers as directed.\n';
    }
    
    if (hasStomachPain || hasNausea) {
      diagnosis += '- **For Stomach Issues**: Follow the BRAT diet (Bananas, Rice, Applesauce, Toast), stay hydrated with small sips of clear fluids, and avoid dairy, caffeine, alcohol, and spicy foods.\n';
    }
    
    if (hasDiarrhea) {
      diagnosis += '- **For Diarrhea**: Stay well-hydrated with water, clear broth, or electrolyte solutions. Avoid dairy, fatty, or high-fiber foods temporarily. Gradually reintroduce normal diet as symptoms improve.\n';
    }
    
    if (hasJointPain) {
      diagnosis += '- **For Joint Pain**: Rest the affected joint, apply ice for 15-20 minutes several times daily, consider compression with an elastic bandage, and elevate the affected area when possible.\n';
    }
    
    if (hasRash) {
      diagnosis += '- **For Skin Issues**: Avoid scratching, apply cool compresses, try over-the-counter hydrocortisone cream for itching, and use mild soap without fragrances.\n';
    }
    
    diagnosis += '- **General Advice**: Get plenty of rest, stay hydrated with water and clear fluids, and wash hands frequently to prevent spreading illness.\n';
    
    // Add when to seek medical attention section
    diagnosis += '\n### When to Seek Medical Attention\n\n';
    
    // General warning signs
    diagnosis += '- Fever over 103°F (39.4°C) or that persists more than 3 days\n';
    diagnosis += '- Severe headache with stiff neck, confusion, or that worsens despite treatment\n';
    diagnosis += '- Difficulty breathing, shortness of breath, or rapid breathing\n';
    diagnosis += '- Persistent vomiting or inability to keep fluids down for more than 24 hours\n';
    diagnosis += '- Symptoms that worsen significantly or don\'t improve after several days\n';
    
    // Condition-specific warning signs
    if (hasChestPain) {
      diagnosis += '- **URGENT**: Any chest pain, especially if severe, spreading to arms/jaw, or accompanied by shortness of breath requires immediate emergency care\n';
    }
    
    if (hasDizziness) {
      diagnosis += '- Severe dizziness, inability to stand, or fainting requires prompt medical attention\n';
    }
    
    if (hasBleedingIssue) {
      diagnosis += '- Any unusual bleeding that doesn\'t stop with direct pressure requires medical care\n';
    }
    
    if (symptomsLower.includes('breath') || symptomsLower.includes('breathing')) {
      diagnosis += '- Any significant difficulty breathing or shortness of breath requires immediate medical attention\n';
    }
    
    // Add disclaimer
    diagnosis += '\n### Disclaimer\n\n';
    diagnosis += 'This information is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of information received from this application.';
    
    return diagnosis;
  }
}
