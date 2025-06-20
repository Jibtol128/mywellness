// Simple script to test if the Gemini API key is valid
const apiKey = 'AIzaSyDIgEyEea-bGd_ygJh9Q5d35ozcnnljBEc';
const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

async function testGeminiAPI() {
  console.log('Testing Gemini API with key:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));
  
  const requestBody = {
    contents: [
      {
        parts: [
          { text: "Hello, what is 1+1?" }
        ]
      }
    ]
  };
  
  try {
    console.log('Sending request to:', apiUrl);
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
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.candidates && data.candidates.length > 0) {
      console.log('Success! API key is valid and working.');
      if (data.candidates[0].content?.parts?.[0]?.text) {
        console.log('AI response:', data.candidates[0].content.parts[0].text);
      }
    } else {
      console.log('API key is not working correctly.');
      if (data.error) {
        console.log('Error details:', data.error);
      }
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testGeminiAPI();
