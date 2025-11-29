// supabase/functions/generate-ai-image/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Necesitas la clave secreta de OpenAI en tus variables de entorno de Supabase
const OPENAI_SECRET_KEY = Deno.env.get('OPENAI_SECRET_KEY')

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
        return new Response('Método no permitido', { status: 405 })
    }

    const { prompt } = await req.json()

    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Falta el parámetro "prompt".' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    // 1. LLAMAR A LA FUNCIÓN DE VALIDACIÓN/DESCUENTO DE CRÉDITOS
    const planCreditFunctionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-plan-credit`

    const creditCheckResponse = await fetch(planCreditFunctionUrl, {
        method: 'POST',
        headers: {
            // Reutilizamos el token de autorización del cliente
            'Authorization': req.headers.get('Authorization')!,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // No necesitamos enviar cuerpo, solo la auth
    })

    const creditCheckData = await creditCheckResponse.json()

    if (creditCheckResponse.status !== 200) {
        // Si falla la validación (créditos insuficientes, etc.)
        return new Response(
            JSON.stringify({ error: creditCheckData.error || 'Fallo en la validación de créditos.' }),
            { headers: { 'Content-Type': 'application/json' }, status: creditCheckResponse.status }
        )
    }

    // Créditos descontados exitosamente. Proceder con la llamada a la IA.

    // 2. LLAMAR A OPENAI
    const openAIResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_SECRET_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt: prompt,
        n: 1, // Número de imágenes a generar
        size: '512x512',
      }),
    })

    const openAIData = await openAIResponse.json()

    if (!openAIResponse.ok) {
        console.error('Error de OpenAI:', openAIData.error)
        return new Response(JSON.stringify({ error: 'Error al generar la imagen con OpenAI.' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }

    // 3. Respuesta exitosa con la URL de la imagen y los créditos restantes
    return new Response(
        JSON.stringify({
            imageUrl: openAIData.data[0].url,
            remainingCredits: creditCheckData.remainingCredits, // Devolvemos los créditos actualizados
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error en generate-ai-image:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})