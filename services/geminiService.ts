import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a Blob to a Base64 string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Sends text or audio to Gemini and gets a text response (and potentially audio logic).
 */
export const generateBotResponse = async (
  history: { role: 'user' | 'model'; text?: string }[],
  audioInputBase64?: string
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct contents
    const contents: any[] = [];
    
    // Add history context (simplified for this demo, in prod usually last N messages)
    // We filter out purely audio messages from history if we didn't store the transcript, 
    // but for this demo we assume text history is maintained.
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text || "..." }]
    }));

    // Current message construction
    const currentParts: any[] = [];
    
    if (audioInputBase64) {
      currentParts.push({
        inlineData: {
          mimeType: 'audio/wav', // Assuming recorder produces wav/webm
          data: audioInputBase64
        }
      });
      currentParts.push({ text: "Respondé a este audio siguiendo tu personalidad." });
    } else {
      // If it's just history, the last item is the prompt. 
      // However, the function caller usually appends the new message to history before calling.
      // Let's assume the last message in 'history' is the new user prompt if no audio.
      // Actually, standard pattern: History contains previous turns. New content is separate.
      // Let's adjust: The caller passes the full history INCLUDING the latest message.
    }

    // For simplicity in this functional component architecture, we will rely on 
    // sending the whole chat structure to 'generateContent' via contents array 
    // or use chat.sendMessage if we were maintaining a session object. 
    // Here we use stateless generateContent for easier debugging.
    
    // Let's re-format for the API properly:
    // We need to merge instructions and history.
    
    // We will use the last message from history as the "prompt" and the rest as context if possible,
    // OR just send the last message with a strong system instruction if context window allows.
    // Given the complexity of mixing audio/text history in a stateless call, 
    // we will prioritize the SYSTEM_INSTRUCTION + Current Input.
    
    // Extract the latest user message
    const lastUserMsg = history[history.length - 1];
    
    const parts = [];
    if (audioInputBase64) {
       parts.push({
        inlineData: {
          mimeType: 'audio/webm',
          data: audioInputBase64
        }
       });
       parts.push({ text: "El usuario envió un audio. Escuchalo y respondé." });
    } else {
       parts.push({ text: lastUserMsg.text || "(Mensaje vacío)" });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: parts }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep thought for chat
      }
    });

    return response.text || "¡Uy! Me quedé tildado, bancame un toque y probá de nuevo.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "¡Che, se me cayó el sistema! Hubo un error técnico. Probá en un ratito.";
  }
};

/**
 * Generates speech (TTS) from the bot's text response.
 * Uses a male voice.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Fenrir is a deep male voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};
