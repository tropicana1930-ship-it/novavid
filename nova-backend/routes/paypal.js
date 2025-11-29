// routes/paypal.js
import express from "express";
import paypal from "paypal-rest-sdk";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bodyParser from "body-parser";

dotenv.config();
const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Configurar PayPal
paypal.configure({
  mode: "sandbox", // cambiar a "live" para producción
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

const PLANS = {
  premium_monthly: "P-1CU872153T160240CNEUZ6GQ",
  pro_monthly: "P-5TU115583H392493PNEUZ7WY",
  premium_yearly: "P-915366303B503794PNEU2BBI",
  pro_yearly: "P-3YX87057DC5843453NEU2CKI"
};

// Crear suscripción PayPal
router.post("/create-subscription", async (req, res) => {
  try {
    const { planKey, userId } = req.body;
    const planId = PLANS[planKey];
    if (!planId) return res.status(400).json({ error: "Plan inválido" });

    const billingAgreementAttributes = {
      name: `NovaVid ${planKey}`,
      description: `Suscripción NovaVid ${planKey}`,
      start_date: new Date(new Date().getTime() + 60000).toISOString(),
      plan: { id: planId },
      payer: { payment_method: "paypal" },
      // En custom_id se puede guardar userId
      override_merchant_preferences: { custom_id: userId }
    };

    paypal.billingAgreement.create(billingAgreementAttributes, (error, agreement) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Error creando suscripción PayPal" });
      }
      const approvalUrl = agreement.links.find(link => link.rel === "approval_url").href;
      res.json({ approvalUrl });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando suscripción PayPal" });
  }
});

// Webhook PayPal
router.post("/webhook", bodyParser.json(), async (req, res) => {
  const event = req.body;

  try {
    if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const userId = event.resource.custom_id;
      const planKey = event.resource.plan_id;
      const planType = planKey.includes("premium") ? "premium" : "pro";
      const period = planKey.includes("monthly") ? "monthly" : "yearly";

      await supabase.from("subscriptions").insert([
        {
          user_id: userId,
          plan_type: planType,
          period: period,
          provider: "paypal",
          start_date: new Date(),
          end_date: period === "monthly" ? new Date(new Date().setMonth(new Date().getMonth() + 1)) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          status: "active"
        }
      ]);

      console.log("Suscripción PayPal guardada en Supabase:", userId);
    }
  } catch (err) {
    console.error("Error procesando webhook PayPal:", err);
  }

  res.sendStatus(200);
});

export default router;
