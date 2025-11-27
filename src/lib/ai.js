import OpenAI from 'openai';

// Recupera la clave de las variables de entorno
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

// Inicializa el cliente oficial
// "dangerouslyAllowBrowser: true" es necesario en Vite/React para desarrollo
export const openai = apiKey 
  ? new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true 
    })
  : null;

export function handleAIError(error) {
  console.error("Error de IA:", error);
  // Devuelve un mensaje amigable para mostrar en la interfaz
  return error?.message || "Ocurrió un error al conectar con el asistente.";
}