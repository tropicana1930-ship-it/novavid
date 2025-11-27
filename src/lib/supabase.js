import { createClient } from "@supabase/supabase-js";

// Usamos cadenas vacías como fallback para evitar que createClient lance un error fatal si las env vars no existen
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🔴 Error Crítico: Faltan las variables de entorno de Supabase. Revisa tu archivo .env");
}

// createClient fallará si la URL no es válida, así que solo lo creamos si hay URL, o usamos un mock seguro
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null; // Exportamos null en lugar de romper la app. Tu AuthContext deberá manejar esto.