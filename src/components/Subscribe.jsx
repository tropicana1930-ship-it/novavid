import React, { useEffect, useState } from "react";

const plans = [
  { name: "Premium Mensual", type: "premium", period: "monthly", paypalKey: "premium_monthly", stripeKey: "premium_monthly", price: "$19" },
  { name: "Pro Mensual", type: "pro", period: "monthly", paypalKey: "pro_monthly", stripeKey: "pro_monthly", price: "$49" },
  { name: "Premium Anual", type: "premium", period: "yearly", paypalKey: "premium_yearly", stripeKey: "premium_yearly", price: "$180" },
  { name: "Pro Anual", type: "pro", period: "yearly", paypalKey: "pro_yearly", stripeKey: "pro_yearly", price: "$468" },
];

export default function Subscribe({ userId }) {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const sub = await window.novaAPI.getSubscription(userId);
        setSubscription(sub);
      } catch (err) {
        console.error("Error obteniendo suscripción:", err);
      }
    }
    fetchSubscription();
  }, [userId]);

  const handlePayPal = (planKey) => window.novaAPI.subscribePayPal(planKey, userId);
  const handleStripe = (planKey) => window.novaAPI.subscribeStripe(planKey, userId);

  return (
    <div className="subscribe-container p-6">
      <h1 className="text-2xl font-bold mb-4">Elige tu plan</h1>

      {subscription ? (
        <div className="mb-4 p-4 border rounded bg-green-50">
          <p>Suscripción activa: <strong>{subscription.plan_type} {subscription.period}</strong></p>
          <p>Válida hasta: {new Date(subscription.end_date).toLocaleDateString()}</p>
        </div>
      ) : (
        <p className="mb-4 text-gray-700">No tienes suscripción activa.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isActive = subscription?.plan_type === plan.type && subscription?.period === plan.period;
          return (
            <div key={plan.name} className="plan-card border rounded-lg p-4 shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-gray-600 mb-2">Precio: {plan.price}</p>

              <div className="flex gap-2">
                <button
                  disabled={isActive}
                  onClick={() => handlePayPal(plan.paypalKey)}
                  className={`px-4 py-2 rounded ${isActive ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  Pagar con PayPal
                </button>

                <button
                  disabled={isActive}
                  onClick={() => handleStripe(plan.stripeKey)}
                  className={`px-4 py-2 rounded ${isActive ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                >
                  Pagar con Stripe
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
