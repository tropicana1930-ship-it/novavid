// supabase/functions/stripe-webhook/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Inicializa Stripe con tu clave secreta
// NOTA: Se requiere la variable de entorno STRIPE_SECRET_KEY
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
});

// Inicializa el cliente de Supabase (con permisos de service_role)
// NOTA: Se requiere la variable de entorno SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Mapeo de IDs de precios de Stripe a claves de plan de NovaVid (debe coincidir con la columna 'plan' de tu DB)
// *** REEMPLAZA ESTOS EJEMPLOS CON TUS IDs REALES DE PRODUCTO/PRECIO DE STRIPE ***
const PLAN_MAPPING: Record<string, string> = {
    'price_dRmdR8bDa9lSd8kdct2Fa08': 'premium', // Ejemplo: Premium Mensual
    'price_5kQ3cu7mU8hO1pC0pH2Fa09': 'pro',     // Ejemplo: Pro Mensual
    // Agrega tus otros IDs de precios (ej. planes anuales, etc.)
    // 'price_XXXXXXXXXXXXXXX': 'otro_plan',
};

// Se requiere la variable de entorno STRIPE_WEBHOOK_SECRET
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req) => {
    // 1. Obtener el cuerpo y la firma del webhook
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!webhookSecret) {
        return new Response('STRIPE_WEBHOOK_SECRET no configurado', { status: 500 });
    }

    if (!signature) {
        return new Response('Falta la firma de Stripe', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // 2. Construir el evento de Stripe de forma segura
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (error) {
        console.error('Error al verificar la firma del webhook:', error.message);
        return new Response(`Error: ${error.message}`, { status: 400 });
    }

    const data = event.data.object as any; // Usamos 'any' para un acceso más fácil a las propiedades

    try {
        // Manejar eventos de creación y actualización de suscripción
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
            const subscription = data as Stripe.Subscription;
            
            // Si la suscripción no tiene ítems de precio o el ID de precio no existe, salir.
            if (!subscription.items.data.length || !subscription.items.data[0].price?.id) {
                return new Response('Suscripción sin ID de precio válido', { status: 200 });
            }

            const priceId = subscription.items.data[0].price.id;
            // Mapeamos el ID de precio al plan interno de la DB. Si el estado es 'canceled', el plan debe ser 'free'.
            const planKey = subscription.status === 'canceled' || subscription.status === 'unpaid' 
                ? 'free' 
                : PLAN_MAPPING[priceId] || 'free'; 
            
            // Obtener el user_id de Supabase a partir del customer_id de Stripe
            const { data: userData, error: userLookupError } = await supabaseAdmin
                .from('subscriptions')
                .select('user_id')
                .eq('stripe_customer_id', subscription.customer)
                .limit(1) // Siempre limitar a 1
                .single();
            
            if (userLookupError && userLookupError.code !== 'PGRST116') { // Ignorar 'PGRST116' (no rows found)
                throw userLookupError;
            }

            const userId = userData?.user_id || null;
            
            // Si el user_id no se encuentra, la primera vez (al crear el cliente de Stripe), Stripe aún no nos ha devuelto el ID de Supabase.
            // Para una configuración completa, necesitarías manejar `customer.created` y asociar el `customer.id` de Stripe al `user_id` de Supabase.
            // Asumiendo que esta asociación ya existe en la tabla 'subscriptions' gracias al checkout (Tarea 1.4).
            
            if (userId) {
                // 3. Llamar a la función PostgreSQL para la actualización segura
                const { error: dbError } = await supabaseAdmin.rpc('handle_subscription_update', {
                    p_user_id: userId,
                    p_customer_id: subscription.customer as string,
                    p_subscription_id: subscription.id,
                    p_status: subscription.status,
                    p_plan_key: planKey,
                    // current_period_end es un timestamp de Stripe (segundos), lo convertimos a milisegundos y luego a ISO string
                    p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                });
                
                if (dbError) {
                    console.error('Error al llamar a handle_subscription_update:', dbError);
                    throw dbError;
                }
                
                console.log(`Suscripción de usuario ${userId} actualizada a plan: ${planKey} y estado: ${subscription.status}`);

            } else {
                console.warn(`No se encontró user_id para el customer_id de Stripe: ${subscription.customer}`);
                // En un sistema de producción, podrías registrar este evento para asociarlo manualmente o investigar por qué la entrada en 'subscriptions' falta.
            }
        }
        
        // Manejar cancelación de suscripción (ej. el cliente cancela en el portal de Stripe)
        if (event.type === 'customer.subscription.deleted') {
            const subscription = data as Stripe.Subscription;

            // Busca al usuario asociado
            const { data: userData } = await supabaseAdmin
                .from('subscriptions')
                .select('user_id')
                .eq('stripe_subscription_id', subscription.id)
                .single();
            
            const userId = userData?.user_id || null;
            
            if (userId) {
                 // Llamar a la función PostgreSQL para establecer el plan a 'free' y actualizar el estado
                const { error: dbError } = await supabaseAdmin.rpc('handle_subscription_update', {
                    p_user_id: userId,
                    p_customer_id: subscription.customer as string,
                    p_subscription_id: subscription.id,
                    p_status: subscription.status, // Debería ser 'canceled'
                    p_plan_key: 'free', // Forzar a 'free' tras la eliminación
                    p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                });

                if (dbError) throw dbError;
                
                console.log(`Suscripción de usuario ${userId} eliminada. Plan establecido a 'free'.`);
            }
        }


        // Ignoramos otros eventos (ej. invoice.paid, checkout.session.completed) porque los manejamos a través de subscription.created/updated

        return new Response('Webhook recibido con éxito', { status: 200 });

    } catch (error) {
        console.error('Error general al procesar el webhook:', error.message);
        return new Response(`Error interno al procesar: ${error.message}`, { status: 400 });
    }
})
```
eof

#### 2. Pasos Adicionales y Pendientes

Una vez que guardes el archivo anterior, los pasos restantes son críticos:

| Paso | Estado | Descripción | Acción Necesaria |
| :--- | :--- | :--- | :--- |
| **A. Despliegue de la Función** | PENDIENTE | Subir el código del Webhook a Supabase. | **Ejecutar el comando de despliegue.** |
| **B. Variables de Entorno** | PENDIENTE | Configurar las claves secretas de Stripe en Supabase. | **Debes configurar estas variables.** |
| **C. Configuración del Webhook** | PENDIENTE | Informar a Stripe la URL de la función para que envíe los eventos. | **Debes obtener la URL y configurarla en Stripe.** |

### 👉 Próximos Pasos

Para que esta Tarea 2 esté completa, solo necesitamos ejecutar el comando de despliegue y confirmar la configuración de las variables de entorno:

1.  **Desplegar la Edge Function de Stripe:**

    ```bash
    supabase functions deploy stripe-webhook