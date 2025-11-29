// routes/subscription.js
import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// POST /subscription/get
router.post("/get", async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "userId es requerido" });

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("end_date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") return res.status(500).json({ error: error.message });

    res.json({ subscription: data || null });
  } catch (err) {
    console.error("Error obteniendo suscripción:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
