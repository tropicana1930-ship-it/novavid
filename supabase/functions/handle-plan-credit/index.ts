// supabase/functions/handle-plan-credit/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Define los precios y límites de los planes (esto debería ser consultado desde la base de datos o un archivo de configuración en una aplicación real)
const PLANS = {
  FREE: {
    limit: 10, // Límite de créditos total para el plan Free
    creditCost: 1, // Costo por imagen
  },
  PRO: {
    limit: 0, // 0 indica "créditos ilimitados" con recarga automática para este ejercicio
    creditCost: 1, // Costo por imagen
  },
}

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 1. Obtener la sesión del usuario
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario no autenticado.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Obtener el perfil del usuario (plan y créditos)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('plan, credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error al obtener el perfil:', profileError)
      return new Response(JSON.stringify({ error: 'No se pudo obtener el perfil del usuario.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const currentPlan = profile.plan.toUpperCase() as keyof typeof PLANS
    const currentCredits = profile.credits
    const planConfig = PLANS[currentPlan] || PLANS.FREE
    const creditCost = planConfig.creditCost

    // 3. Validación de límites y recarga (Lógica Central)
    let finalCredits = currentCredits

    // Si el usuario es PRO y el límite es 0, simulamos una recarga automática si los créditos son insuficientes.
    if (currentPlan === 'PRO' && planConfig.limit === 0) {
        // En este ejemplo simple, si el usuario PRO tiene menos del costo, le "recargamos" 100 créditos
        if (finalCredits < creditCost) {
            console.log(`Recargando créditos para usuario PRO: ${user.id}`)
            finalCredits = 100 
        }
    } else if (finalCredits < creditCost) {
        // Si no es PRO y no tiene suficientes créditos, falla la validación.
        return new Response(
            JSON.stringify({ error: 'Créditos insuficientes. Por favor, recargue su cuenta o actualice su plan.' }),
            { headers: { 'Content-Type': 'application/json' }, status: 403 }
        )
    }

    // 4. Aplicar el descuento
    finalCredits -= creditCost

    // 5. Actualizar la base de datos
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ credits: finalCredits })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error al actualizar créditos:', updateError)
      return new Response(JSON.stringify({ error: 'Error interno al actualizar créditos.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 6. Respuesta exitosa (devuelve los créditos restantes)
    return new Response(
        JSON.stringify({
            message: 'Créditos descontados exitosamente.',
            remainingCredits: finalCredits,
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error en handle-plan-credit:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})