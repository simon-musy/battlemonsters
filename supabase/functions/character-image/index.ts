import OpenAI from 'jsr:@openai/openai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Image generation request started`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log(`[${requestId}] URL: ${req.url}`);
  console.log(`[${requestId}] Headers:`, Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${requestId}] Parsing request body...`);
    const body = await req.json();
    console.log(`[${requestId}] Request body:`, body);

    const { prompt } = body;

    if (!prompt) {
      console.error(`[${requestId}] Missing prompt in request`);
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${requestId}] Image prompt: "${prompt}"`);

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error(`[${requestId}] OpenAI API key not found in environment`);
      throw new Error('OpenAI API key not configured');
    }

    console.log(`[${requestId}] Initializing OpenAI client...`);
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log(`[${requestId}] Making DALL-E API call...`);
    const startTime = Date.now();
    
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1
    });

    const endTime = Date.now();
    console.log(`[${requestId}] DALL-E API call completed in ${endTime - startTime}ms`);

    if (!result.data || result.data.length === 0) {
      console.error(`[${requestId}] No image data returned from DALL-E`);
      throw new Error('No image generated');
    }

    const imageUrl = result.data[0].url;
    if (!imageUrl) {
      console.error(`[${requestId}] No image URL in response`);
      console.error(`[${requestId}] Full response:`, JSON.stringify(result, null, 2));
      throw new Error('No image URL returned');
    }

    console.log(`[${requestId}] Image generation successful`);
    console.log(`[${requestId}] Generated image URL: ${imageUrl}`);

    return new Response(
      JSON.stringify({ url: imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`[${requestId}] Error in image generation:`, error);
    console.error(`[${requestId}] Error stack:`, error.stack);
    
    // Log additional error details for OpenAI API errors
    if (error.response) {
      console.error(`[${requestId}] OpenAI API error response:`, error.response.status);
      console.error(`[${requestId}] OpenAI API error data:`, error.response.data);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        requestId: requestId
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});