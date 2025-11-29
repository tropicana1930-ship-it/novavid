// preload.js — comunicación segura entre Renderer y Backend
import { contextBridge } from "electron";

const BACKEND_URL = "http://localhost:4242"; // Cambia si tu backend está en otro puerto

// Función para hacer llamadas al backend
async function callBackend(path, data, rawBody = false) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody ? data : JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error("Error en backend:", err);
    return { error: err.message };
  }
}

// Exponer API segura a renderer
contextBridge.exposeInMainWorld("novaAPI", {
  // Stripe
  async subscribeStripe(planKey, userId) {
    const result = await callBackend("/stripe/create-checkout-session", { planKey, userId });
    if (result.id) {
      const stripeUrl = `https://checkout.stripe.com/pay/${result.id}`;
      window.open(stripeUrl, "_blank", "width=800,height=700");
    } else {
      console.error("Error creando sesión Stripe:", result.error);
    }
  },

  // PayPal
  async subscribePayPal(planKey, userId) {
    const result = await callBackend("/paypal/create-subscription", { planKey, userId });
    if (result.approvalUrl) {
      window.open(result.approvalUrl, "_blank", "width=800,height=700");
    } else {
      console.error("Error creando suscripción PayPal:", result.error);
    }
  },

  // Obtener suscripción activa del usuario
  async getSubscription(userId) {
    const result = await callBackend("/subscription/get", { userId });
    if (result.error) {
      console.error("Error obteniendo suscripción:", result.error);
      return null;
    }
    return result.subscription || null;
  }
});
