import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, pptxText } = await req.json()
    
    if (!topic) {
      throw new Error("El tema (topic) es requerido");
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error("No hay API Key de OpenAI configurada");
    }

    const systemPrompt = `Eres un experto creador de presentaciones de alto impacto para la marca Auténticos.
    Tu objetivo es estructurar una presentación en base al tema dado.
    Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
    {
      "slides": [
        {
          "id": "uuid-v4-generado",
          "type": "cover" | "split_image" | "timeline" | "icon_grid",
          "content": {
            // para 'cover': title, subtitle
            // para 'split_image': title, text
            // para 'timeline': title, steps (array de objetos con 'label' y 'description')
            // para 'icon_grid': title, items (array de objetos con 'title' y 'text')
          }
        }
      ]
    }
    
    Reglas:
    1. La primera slide SIEMPRE debe ser tipo 'cover'.
    2. Crea entre 5 y 8 diapositivas en total.
    3. Los textos deben ser concisos, inspiradores y profesionales.
    4. NO incluyas markdown (como \`\`\`json), solo el JSON crudo.
    `;

    let userPrompt = `Crea una presentación sobre: ${topic}`;
    if (pptxText) {
      userPrompt = `Aquí tienes el texto crudo de una presentación antigua (sobre ${topic}):\n\n${pptxText}\n\nPor favor, extrae las ideas más valiosas, resúmelas si es necesario, y reestructúralas estrictamente usando el formato JSON requerido. No pierdas la esencia del mensaje original.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const presentationJson = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({ success: true, presentation: presentationJson }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
