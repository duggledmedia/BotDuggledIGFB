// NO importamos GoogleGenAI aquí arriba para que el archivo cargue instantáneo.
// Esto evita errores de timeout o dependencias durante la verificación de Meta.

const VERIFY_TOKEN = "DuggledBot";

export default async function handler(req, res) {
  // =========================================================================
  // A. VERIFICACIÓN (GET) - Esto tiene que ser RÁPIDO y SIN ERRORES
  // =========================================================================
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log("--> Intento de verificación GET recibido");
    console.log("Datos:", { mode, token, challenge });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log("--> Verificación EXITOSA. Devolviendo challenge.");
      // Respondemos con el challenge tal cual llegó.
      return res.status(200).send(challenge);
    } else {
      console.log("--> Verificación FALLIDA. Token incorrecto o modo inválido.");
      return res.status(403).json({ error: 'Token incorrecto. Usa: DuggledBot' });
    }
  }

  // =========================================================================
  // B. MENSAJES (POST) - Aquí cargamos la IA solo si es necesario
  // =========================================================================
  if (req.method === 'POST') {
    try {
      const body = req.body;

      // 1. Responder a Meta inmediatamente para que no reintenten
      res.status(200).send('EVENT_RECEIVED');

      if (body.object === 'instagram') {
        // Importación dinámica: Solo cargamos la librería pesada AHORA
        // Esto evita que el servidor explote si falta la API Key al inicio
        const { GoogleGenAI } = await import("@google/genai");
        
        // Procesamos mensajes
        for (const entry of body.entry) {
          if (entry.messaging) {
            for (const event of entry.messaging) {
              // Ignorar ecos (mensajes enviados por el bot)
              if (event.message && !event.message.is_echo) {
                const senderId = event.sender.id;
                
                // Lógica principal
                if (process.env.API_KEY && process.env.IG_ACCESS_TOKEN) {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    
                    if (event.message.text) {
                      await handleTextMessage(ai, senderId, event.message.text);
                    } 
                    else if (event.message.attachments && event.message.attachments[0].type === 'audio') {
                       await sendInstagramMessage(senderId, "🎧 ¡Recibí tu audio! Dame un toque que lo proceso (versión texto por ahora).");
                    }
                } else {
                    console.error("Faltan variables de entorno (API_KEY o IG_ACCESS_TOKEN)");
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error en el proceso POST:", error);
    }
    return;
  }
  
  // Si no es GET ni POST
  res.status(405).end();
}

// --- FUNCIONES AUXILIARES ---

async function handleTextMessage(ai, recipientId, text) {
  try {
    const SYSTEM_INSTRUCTION = `
    Eres el asistente virtual de Duggled (www.duggled.com.ar).
    Tu objetivo: VENDER servicios de Diseño Web + Marketing Digital.
    Personalidad: Argentino, porteño, buena onda, usas emojis.
    Regla de oro: Respuestas cortas y SIEMPRE intentar cerrar reunión o pedir WhatsApp.
    Si te saludan, presentate como un asistente virtual automatizado.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 150,
      }
    });

    const botReply = response.text || "¡Uy! Me quedé tildado. ¿Me repetís?";
    await sendInstagramMessage(recipientId, botReply);

  } catch (error) {
    console.error("Error generando respuesta IA:", error);
  }
}

async function sendInstagramMessage(recipientId, text) {
  const token = process.env.IG_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${token}`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: text }
      })
    });
  } catch (error) {
    console.error("Error enviando a Meta:", error);
  }
}