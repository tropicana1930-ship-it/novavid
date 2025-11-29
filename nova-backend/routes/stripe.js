// routes/stripe.js — Manejo de suscripciones Stripe
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Mapear planes a los Price IDs de Stripe
const PLANS = {
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID
};

// POST /stripe/create-checkout-session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { planKey, userId } = req.body;
    const priceId = PLANS[planKey];

    if (!priceId) return res.status(400).json({ error: "Plan inválido" });
    if (!userId) return res.status(400).json({ error: "userId es requerido" });

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { userId }
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Error creando sesión Stripe:", err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook Stripe (opcional) para recibir actualizaciones de suscripción
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook Stripe inválido:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Procesar evento
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Suscripción Stripe completada:", session.metadata.userId, session.subscription);
      // Aquí puedes guardar la suscripción en Supabase
      break;

    case "customer.subscription.updated":
      console.log("Suscripción actualizada:", event.data.object);
      break;

    case "customer.subscription.deleted":
      console.log("Suscripción eliminada:", event.data.object);
      break;

    default:
      console.log(`Evento Stripe recibido: ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
