import { getDiagnosis } from '@/utils/gemini';
import { cleanCache } from '@/utils/cache';

export async function POST(request) {
  try {
    console.log('API Route: Starting diagnosis request');
    
    // Periodically clean expired cache entries (with low probability)
    if (Math.random() < 0.1) { // 10% chance per request
      try {
        const removedEntries = await cleanCache();
        if (removedEntries > 0) {
          console.log(`API Route: Removed ${removedEntries} expired cache entries`);
        }
      } catch (cacheError) {
        console.error('API Route: Cache cleaning error:', cacheError);
      }
    }
    
    // Verify the API key is configured - check both environment variables
    const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('API Route: Google API key not configured in any environment variable');
      return Response.json(
        { error: 'API configuration error - missing API key' },
        { status: 500 }
      );
    }
    
    console.log('API Route: API key found', apiKey.substring(0, 3) + '...' + apiKey.substring(apiKey.length - 3));
    
    let symptoms;
    
    try {
      const body = await request.json();
      symptoms = body.symptoms;
    } catch (parseError) {
      console.error('API Route: Error parsing request body', parseError);
      return Response.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    if (!symptoms?.trim()) {
      console.error('API Route: No symptoms provided');
      return Response.json(
        { error: 'Please enter your symptoms' },
        { status: 400 }
      );
    }

    console.log('API Route: Processing symptoms:', symptoms);
    
    try {
      const diagnosis = await getDiagnosis(symptoms);
      
      if (!diagnosis) {
        console.error('API Route: No diagnosis returned');
        return Response.json(
          { error: 'Failed to generate diagnosis' },
          { status: 500 }
        );
      }
      
      console.log('API Route: Diagnosis successful - length:', diagnosis.length);
      return Response.json({ diagnosis });
      
    } catch (diagnosisError) {
      console.error('API Route: Error during diagnosis generation:', diagnosisError);
      return Response.json(
        { 
          error: diagnosisError.message || 'Failed to generate diagnosis',
          details: diagnosisError.toString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Route: Unexpected error:', error);
    return Response.json(
      { 
        error: 'An unexpected error occurred',
        details: error.toString() 
      },
      { status: 500 }
    );
  }
}
