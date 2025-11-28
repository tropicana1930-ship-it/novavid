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

// NUEVA FUNCIÓN: Generación de Imágenes (DALL-E 3)
export async function generateImage(prompt) {
  if (!openai) throw new Error("AI not configured");

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json" // Usamos base64 para evitar problemas de CORS con URLs externas
  });

  return "data:image/png;base64," + response.data[0].b64_json;
}