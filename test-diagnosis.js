// Test the updated model
const apiKey = 'AIzaSyDIgEyEea-bGd_ygJh9Q5d35ozcnnljBEc';
const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

async function testGeminiAPI() {
  console.log('Testing Gemini API with key:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));
  console.log('Using model URL:', apiUrl);
  
  const requestBody = {
    contents: [
      {
        parts: [
          { text: "I have a headache and sore throat. What could be wrong?" }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048
    }
  };
  
  try {
    console.log('Sending request...');
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    const data = await response.json();
    
    if (response.ok && data.candidates && data.candidates.length > 0) {
      console.log('Success! API is working.');
      if (data.candidates[0].content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        console.log('AI diagnosis (first 300 chars):', text.substring(0, 300) + '...');
      }
    } else {
      console.log('API request failed.');
      console.log('Error details:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testGeminiAPI();
