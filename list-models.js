// Script to list available Gemini models
const apiKey = 'AIzaSyDIgEyEea-bGd_ygJh9Q5d35ozcnnljBEc';
const apiUrl = 'https://generativelanguage.googleapis.com/v1/models';

async function listModels() {
  console.log('Fetching available Gemini models...');
  
  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Available models:');
      if (data.models && data.models.length > 0) {
        data.models.forEach(model => {
          console.log(`- ${model.name} (${model.displayName})`);
          console.log(`  Supported generation methods: ${model.supportedGenerationMethods?.join(', ') || 'None specified'}`);
        });
      } else {
        console.log('No models returned or models array is empty');
      }
    } else {
      const errorData = await response.json();
      console.log('Error response:', errorData);
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();
