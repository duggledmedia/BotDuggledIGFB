import { GoogleGenAI } from "@google/genai";

// 1. CONFIGURACIÓN E INSTRUCCIONES DEL BOT
// Definimos la personalidad aquí mismo para asegurar que el servidor la tenga siempre a mano.
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

// Inicializar Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Función principal que ejecuta Vercel
export default async function handler(req, res) {
  try {
    // A. VERIFICACIÓN DEL WEBHOOK (GET)
    // Meta llama a esto cuando configuras la URL en el panel de developers.
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      // Verifica que el token coincida con el que pusiste en las variables de entorno de Vercel
      if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log("Webhook verificado correctamente.");
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Token de verificación incorrecto.' });
      }
    }

    // B. RECEPCIÓN DE MENSAJES (POST)
    // Meta envía los mensajes aquí.
    if (req.method === 'POST') {
      const body = req.body;

      if (body.object === 'instagram') {
        // Respondemos 200 OK inmediatamente para que Meta no reintente el envío.
        // Procesamos la lógica "en segundo plano" (dentro del límite de tiempo de Vercel).
        
        // Iteramos sobre las entradas (entries)
        for (const entry of body.entry) {
          // Iteramos sobre los eventos de mensajería
          if (entry.messaging) {
            for (const event of entry.messaging) {
              // Verificamos que sea un mensaje de texto y NO sea un eco (mensaje enviado por nosotros mismos)
              if (event.message && !event.message.is_echo) {
                const senderId = event.sender.id;
                
                // Si es texto
                if (event.message.text) {
                  await handleTextMessage(senderId, event.message.text);
                } 
                // Si es audio (Instagram manda adjuntos)
                else if (event.message.attachments && event.message.attachments[0].type === 'audio') {
                   // Por simplicidad, respondemos que escuchamos el audio
                   await sendMessage(senderId, "¡Recibí tu audio, crack! 🎧 Bancame que lo escucho (mentira, soy un bot de texto por ahora, pero escribime qué necesitás y te ayudo al toque).");
                }
              }
            }
          }
        }
        return res.status(200).send('EVENT_RECEIVED');
      } else {
        return res.status(404).send('No es un evento de Instagram');
      }
    }
    
    // Si no es GET ni POST
    return res.status(405).end();

  } catch (error) {
    console.error("Error en el Webhook:", error);
    return res.status(500).send('Error interno del servidor');
  }
}

// LÓGICA DE INTELIGENCIA ARTIFICIAL
async function handleTextMessage(recipientId, text) {
  try {
    // 1. Pensar respuesta con Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 150, // Mantener respuesta corta
      }
    });

    const botReply = response.text || "¡Uy! Me quedé tildado. ¿Me repetís?";

    // 2. Enviar respuesta a Instagram
    await sendMessage(recipientId, botReply);

  } catch (error) {
    console.error("Error generando respuesta:", error);
  }
}

// ENVIAR MENSAJE A INSTAGRAM GRAPH API
async function sendMessage(recipientId, text) {
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
    console.error("Error enviando mensaje a Meta:", error);
  }
}