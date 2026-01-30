import { GoogleGenAI } from "@google/genai";

// TOKEN FIJO para asegurar que la verificación de Meta pase sí o sí.
const VERIFY_TOKEN = "DuggledBot";

const SYSTEM_INSTRUCTION = `
Eres el asistente virtual oficial de "Duggled" (www.duggled.com.ar).
Personalidad:
- Argentino, Porteño, canchero pero respetuoso. Usás "vos", "che", "joya", "al toque".
- Tu objetivo es VENDER servicios de Diseño Web y Marketing Digital.
- SIEMPRE buscás cerrar una reunión o pedir el WhatsApp.
- Respuestas CORTAS (máximo 2 frases). Es un chat, no un email.
- Aclará que sos un bot/asistente virtual en el primer mensaje si es un contacto nuevo.

Ejemplos de respuesta:
User: "Precio?"
Bot: "¡Hola genio! 👋 Soy el asistente virtual de Duggled. Los precios dependen del proyecto, ¿qué tenés en mente? Pasame tu celu y te llamamos para asesorarte bien sin compromiso."

User: "Hacen webs?"
Bot: "¡Obvio! Hacemos webs que vuelan 🚀 y le sumamos marketing para que vendas más. ¿Querés agendar una videollamada cortita para ver tu idea?"
`;

export default async function handler(req, res) {
  // A. VERIFICACIÓN DEL WEBHOOK (GET)
  // Esta parte DEBE funcionar perfecto para que Meta te deje guardar la URL.
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log("Intento de verificación:", { mode, token, challenge });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respondemos con el challenge en texto plano (IMPORTANTE: parseInt o conversión numérica a veces rompe, enviar string directo)
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Token incorrecto. Asegurate de usar DuggledBot en Meta.' });
    }
  }

  // B. RECEPCIÓN DE MENSAJES (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === 'instagram') {
        // Responder rápido a Meta para evitar timeouts
        res.status(200).send('EVENT_RECEIVED');

        // Procesar eventos
        for (const entry of body.entry) {
          if (entry.messaging) {
            for (const event of entry.messaging) {
              if (event.message && !event.message.is_echo) {
                const senderId = event.sender.id;
                
                if (event.message.text) {
                  // "Fire and forget" - ejecutamos la lógica sin esperar (await) para que el response anterior salga rápido
                  await processAndReply(senderId, event.message.text);
                } 
                else if (event.message.attachments && event.message.attachments[0].type === 'audio') {
                   await sendMessage(senderId, "¡Recibí tu audio, crack! 🎧 Bancame que lo escucho (mentira, soy un bot de texto por ahora, pero escribime qué necesitás y te ayudo al toque).");
                }
              }
            }
          }
        }
      } else {
        res.status(404).send('Not an Instagram event');
      }
    } catch (error) {
      console.error("Error en POST:", error);
      // No enviamos 500 aquí para no alertar a Meta si ya enviamos 200, pero si falla antes:
      if (!res.headersSent) res.status(500).send('Server Error');
    }
    return;
  }
  
  res.status(405).end();
}

// Función separada para lógica AI + Envío
// Inicializamos la AI aquí adentro para que si falta la API Key, no explote la verificación GET
async function processAndReply(recipientId, text) {
  try {
    if (!process.env.API_KEY) {
      console.error("Falta la API_KEY en Vercel");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 1. Pensar respuesta
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 150,
      }
    });

    const botReply = response.text || "¡Uy! Me quedé pensando... ¿Me repetís?";

    // 2. Enviar a Instagram
    await sendMessage(recipientId, botReply);

  } catch (error) {
    console.error("Error AI/Reply logic:", error);
  }
}

async function sendMessage(recipientId, text) {
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token) {
    console.error("Falta IG_ACCESS_TOKEN en Vercel");
    return;
  }

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
    console.error("Error enviando mensaje a Meta:", error);
  }
}