import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, detectAvailableModel } from '../../services/gemini';
import { checkAndInitDb } from '../../utils/supabaseInit';

export const POST: APIRoute = async () => {
  // Verify and initialize Supabase database tables & RLS policies automatically
  try {
    await checkAndInitDb();
  } catch (dbError: any) {
    console.error('Database connection/initialization failed:', dbError);
  }

  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ 
        status: 'not-configured', 
        error: 'Gemini API key not configured.' 
      }), 
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Auto-detect a valid model first
    const selectedModel = await detectAvailableModel(ai);
    console.log(`Testing connection using model: ${selectedModel}`);
    
    // Make a minimal call to test connection validity
    await ai.models.generateContent({
      model: selectedModel,
      contents: 'Ping',
    });

    return new Response(
      JSON.stringify({ 
        status: 'connected' 
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    const errorStr = error.message || '';
    let friendlyError = errorStr;
    if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      friendlyError = 'Gemini API Quota Exceeded (Rate Limit). Please wait a few minutes or check your billing status in Google AI Studio.';
    } else if (errorStr.includes('not found') || errorStr.includes('model') || errorStr.includes('404')) {
      friendlyError = 'API key validated, but no compatible Gemini models could be retrieved or used. Please check model settings.';
    }

    return new Response(
      JSON.stringify({ 
        status: 'error', 
        error: friendlyError 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
