import { createClient } from "@supabase/supabase-js";

// Usamos cadenas vacías como fallback si las env vars no existen (Vite lo requiere)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

// 🛡️ VERIFICACIÓN CLAVE: Aseguramos que la URL contenga al menos 'http' para ser considerada válida.
const isUrlValid = supabaseUrl && supabaseUrl.startsWith('http');

if (!isUrlValid || !supabaseAnonKey) {
  // Solo mostramos error si no estamos en modo prueba y las claves son necesarias
  if (process.env.NODE_ENV !== 'test') { 
    console.error("🔴 Error Crítico: Faltan las variables de entorno de Supabase o la URL no es válida. Revisa tu archivo .env");
  }
}

// SOLUCIÓN: Solo creamos el cliente si la URL es válida y la clave existe.
export const supabase = (isUrlValid && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null; // Si falla, exportamos null para que la app no se rompa.