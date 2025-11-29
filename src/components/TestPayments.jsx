import React, { useEffect, useState } from "react";

export default function TestPayments() {
  const [subscription, setSubscription] = useState(null);

  const testUserId = "user_test_001"; // ID de prueba

  useEffect(() => {
    // Traer suscripción actual (si existe)
    window.novaAPI.getSubscription(testUserId).then((sub) => {
      setSubscription(sub);
    });
  }, []);

  const handleStripe = async () => {
    const planKey = "premium_monthly"; // prueba con plan
    const result = await window.novaAPI.subscribeStripe(planKey);
    alert("Stripe checkout lanzado: " + JSON.stringify(result));
  };

  const handlePayPal = async () => {
    const planKey = "premium_monthly";
    const result = await window.novaAPI.subscribePayPal(planKey);
    alert("PayPal checkout lanzado: " + JSON.stringify(result));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test de Pagos</h1>

      {subscription ? (
        <div className="mb-4 p-4 border rounded bg-green-50">
          <p>
            Suscripción activa: <strong>{subscription.plan_type}</strong>
          </p>
        </div>
      ) : (
        <p>No hay suscripción activa para este usuario de prueba.</p>
      )}

      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={handleStripe}
        >
          Probar Stripe
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handlePayPal}
        >
          Probar PayPal
        </button>
      </div>
    </div>
  );
}
