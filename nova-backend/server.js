require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 4242;

// Middleware
app.use(bodyParser.json());

// Configuración Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Configuración PayPal
paypal.configure({
  mode: 'sandbox', // cambiar a 'live' en producción
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// --- Rutas de prueba ---
app.get('/', (req, res) => {
  res.send('Backend de NovaVid funcionando!');
});

// --- Stripe Checkout Session ---
app.post('/stripe/create-checkout-session', async (req, res) => {
  const { planKey, userId } = req.body;

  // Mapea planKey a Price ID
  const priceIds = {
    premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceIds[planKey], quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando sesión de Stripe' });
  }
});

// --- PayPal Subscription ---
app.post('/paypal/create-subscription', async (req, res) => {
  const { planKey } = req.body;

  const planUrls = {
    premium_monthly: process.env.PAYPAL_PREMIUM_MONTHLY,
    pro_monthly: process.env.PAYPAL_PRO_MONTHLY,
    premium_yearly: process.env.PAYPAL_PREMIUM_YEARLY,
    pro_yearly: process.env.PAYPAL_PRO_YEARLY
  };

  const subscriptionUrl = planUrls[planKey];
  if (!subscriptionUrl) return res.status(400).json({ error: 'Plan inválido' });

  res.json({ url: subscriptionUrl });
});

// --- Webhook Stripe (opcional) ---
app.post('/stripe/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️  Webhook Stripe inválido', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Suscripción completada:', session);
    // Aquí puedes guardar en Supabase que el usuario pagó
  }

  res.json({ received: true });
});

// --- Webhook PayPal (opcional) ---
app.post('/paypal/webhook', (req, res) => {
  console.log('Webhook PayPal recibido:', req.body);
  res.sendStatus(200);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
