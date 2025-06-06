import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'npm:openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CharacterGenerationResponse {
  character_name: string;
  description: string;
  hp: number;
  energy: number;
  mana: number;
  powers: Array<{
    name: string;
    description: string;
    energy_cost: number;
    cooldown: number;
    damage_range: string;
  }>;
  image_prompt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }));

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a game master creating unique battle characters. Generate a character based on the user's prompt, including stats and powers that are balanced for gameplay."
        },
        {
          role: "user",
          content: `Create a battle character based on this prompt: ${prompt}`
        }
      ],
      functions: [
        {
          name: "generate_character",
          parameters: {
            type: "object",
            properties: {
              character_name: { type: "string" },
              description: { type: "string" },
              hp: { type: "number", minimum: 80, maximum: 150 },
              energy: { type: "number", minimum: 80, maximum: 120 },
              mana: { type: "number", minimum: 0, maximum: 100 },
              powers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    energy_cost: { type: "number", minimum: 10, maximum: 50 },
                    cooldown: { type: "number", minimum: 3, maximum: 10 },
                    damage_range: { type: "string" }
                  },
                  required: ["name", "description", "energy_cost", "cooldown", "damage_range"]
                },
                minItems: 3,
                maxItems: 3
              },
              image_prompt: { type: "string" }
            },
            required: ["character_name", "description", "hp", "energy", "mana", "powers", "image_prompt"]
          }
        }
      ],
      function_call: { name: "generate_character" }
    });

    const result = completion.data.choices[0].message?.function_call?.arguments;
    if (!result) {
      throw new Error('Failed to generate character');
    }

    const character: CharacterGenerationResponse = JSON.parse(result);

    return new Response(
      JSON.stringify(character),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});