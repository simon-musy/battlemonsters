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

    const apiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!apiToken) {
      console.error(`[${requestId}] Replicate API token not found in environment`);
      throw new Error('Replicate API token not configured');
    }

    console.log(`[${requestId}] Making Replicate API call...`);
    const startTime = Date.now();
    
    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          prompt: prompt
        }
      })
    });

    const endTime = Date.now();
    console.log(`[${requestId}] Replicate API call completed in ${endTime - startTime}ms`);
    console.log(`[${requestId}] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] Replicate API error: ${response.status} - ${errorText}`);
      throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[${requestId}] Replicate API response:`, JSON.stringify(result, null, 2));

    // Check if the prediction was successful
    if (result.status === 'failed') {
      console.error(`[${requestId}] Replicate prediction failed:`, result.error);
      throw new Error(`Image generation failed: ${result.error}`);
    }

    // For flux-schnell, the output should be an array of image URLs
    if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
      console.error(`[${requestId}] No image output returned from Replicate`);
      console.error(`[${requestId}] Full response:`, JSON.stringify(result, null, 2));
      throw new Error('No image generated');
    }

    const imageUrl = result.output[0];
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