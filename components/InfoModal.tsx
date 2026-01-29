import React, { useState } from 'react';
import { X, Server, Lock, Key, ShieldCheck, Instagram, Globe, Code, CheckCircle, AlertTriangle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'req' | 'webhook' | 'code'>('req');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Instagram size={24} />
            Integración Técnica
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setActiveTab('req')}
            className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'req' ? 'bg-white text-pink-600 border-t-2 border-pink-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ShieldCheck size={16} /> Requisitos & Permisos
          </button>
          <button 
            onClick={() => setActiveTab('webhook')}
            className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'webhook' ? 'bg-white text-pink-600 border-t-2 border-pink-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Globe size={16} /> Configurar Webhook
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'code' ? 'bg-white text-pink-600 border-t-2 border-pink-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Code size={16} /> Código Vercel
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-white">
          
          {/* TAB 1: REQUISITOS Y PERMISOS */}
          {activeTab === 'req' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Permisos de Meta:</strong> Revisa que tu "Page Access Token" tenga los siguientes scopes aprobados. Si falta uno, Vercel no podrá contestar.
                </p>
              </div>

              <div className="grid gap-3">
                 <PermissionItem name="instagram_basic" desc="Acceso básico al perfil de Instagram." />
                 <PermissionItem name="instagram_manage_messages" desc="CRÍTICO. Permite leer y responder DMs." />
                 <PermissionItem name="pages_manage_metadata" desc="Permite suscribir tu webhook a los eventos de la página." />
                 <PermissionItem name="pages_messaging" desc="Permite enviar mensajes como la Página de Facebook vinculada." />
                 <PermissionItem name="pages_show_list" desc="Necesario para listar las páginas y obtener tokens." />
                 <PermissionItem name="business_management" desc="A veces requerido si la cuenta está en un Business Manager." />
              </div>

              <h3 className="font-bold text-gray-800 mt-6">Infraestructura</h3>
              <div className="grid gap-4 md:grid-cols-2 mt-2">
                <ReqItem 
                  title="Vercel Project"
                  desc="Un proyecto en Vercel donde alojarás la API (Serverless)."
                  icon={<Globe className="w-5 h-5 text-black" />}
                />
                <ReqItem 
                  title="Variables de Entorno"
                  desc="Configura API_KEY (Gemini), IG_TOKEN (Meta) y VERIFY_TOKEN en Vercel."
                  icon={<Key className="w-5 h-5 text-yellow-600" />}
                />
              </div>
            </div>
          )}

          {/* TAB 2: WEBHOOK */}
          {activeTab === 'webhook' && (
            <div className="space-y-6 text-sm text-gray-700">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Configuración en Meta Developers:</h3>
              
              <ol className="relative border-l border-gray-200 ml-3 space-y-8">
                <Step 
                  num="1" 
                  title="URL del Callback" 
                  desc="Si usas Vercel, tu URL será algo como:"
                >
                   <code className="block mt-2 bg-black text-white p-2 rounded text-xs">https://tu-proyecto.vercel.app/api/webhook</code>
                </Step>
                <Step 
                  num="2" 
                  title="Token de Verificación" 
                  desc="Inventa una palabra clave (ej: 'DuggledBot')."
                >
                   <p className="mt-1 text-xs text-orange-600 font-semibold">IMPORTANTE: Debes agregar esta misma palabra en las 'Environment Variables' de Vercel con el nombre <code>VERIFY_TOKEN</code>.</p>
                </Step>
                <Step 
                  num="3" 
                  title="Campos de Suscripción" 
                  desc="En el objeto 'Instagram', suscríbete a:"
                >
                   <div className="flex gap-2 mt-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-mono">messages</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-mono">messaging_postbacks</span>
                   </div>
                </Step>
              </ol>
            </div>
          )}

          {/* TAB 3: CODIGO VERCEL */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <div className="bg-black text-white text-xs px-2 py-1 rounded font-bold">VERCEL</div>
                 <p className="text-sm text-gray-600">Crea este archivo en la ruta <code>/api/webhook.js</code></p>
              </div>

              <div className="relative group">
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre max-h-[500px]">
{`// Archivo: /api/webhook.js en tu proyecto Vercel
// Instalar: npm install @google/genai axios

const { GoogleGenAI } = require("@google/genai");
const axios = require('axios');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const IG_TOKEN = process.env.IG_ACCESS_TOKEN;

export default async function handler(req, res) {
  // 1. VERIFICACIÓN DEL WEBHOOK (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ error: 'Token incorrecto' });
    }
  } 
  // 2. RECIBIR MENSAJES (POST)
  else if (req.method === 'POST') {
    try {
      const body = req.body;
      if (body.object === 'instagram') {
        // Vercel Serverless tiene timeout de 10s (Plan Hobby).
        // Respondemos rápido a Meta y procesamos "fire and forget".
        // Nota: En producción crítica, usar colas (background jobs).
        
        // Iteramos los eventos
        for (const entry of body.entry) {
          for (const event of entry.messaging) {
            if (event.message && event.message.text && !event.message.is_echo) {
              // Procesar sin await para no bloquear respuesta a Meta
              processAndReply(event.sender.id, event.message.text);
            }
          }
        }
        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.status(404).send('Not an Instagram event');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  } else {
    res.status(405).end();
  }
}

async function processAndReply(recipientId, text) {
  try {
    // 1. Preguntar a Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: { 
        systemInstruction: "Sos el bot de Duggled (Argentina). Vendé Web+MKT. Sé breve." 
      }
    });
    const botText = response.text;

    // 2. Responder a Instagram
    await axios.post(
      \`https://graph.facebook.com/v18.0/me/messages?access_token=\${IG_TOKEN}\`,
      {
        recipient: { id: recipientId },
        message: { text: botText }
      }
    );
  } catch (err) {
    console.error("Error processing message:", err.response?.data || err.message);
  }
}`}
                </pre>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800 flex items-start gap-2">
                 <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                 <p>
                   <strong>Nota sobre Vercel Hobby:</strong> Las funciones serverless tienen un tiempo límite. Si Gemini tarda mucho, Meta podría reintentar el envío. 
                   Para uso profesional, considera usar <code>inngest</code> o un VPS.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Subcomponents
const ReqItem = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition flex items-start gap-3">
    <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed mt-1">{desc}</p>
    </div>
  </div>
);

const PermissionItem = ({ name, desc }: { name: string, desc: string }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    <div className="mt-1">
      <CheckCircle size={16} className="text-green-600" />
    </div>
    <div>
      <code className="text-xs font-bold text-purple-700 bg-purple-50 px-1 py-0.5 rounded border border-purple-100">{name}</code>
      <p className="text-xs text-gray-600 mt-1">{desc}</p>
    </div>
  </div>
);

const Step = ({ num, title, desc, children }: { num: string, title: string, desc: string, children?: React.ReactNode }) => (
  <li className="mb-8 ml-6 relative">
    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-9 ring-4 ring-white text-blue-800 font-bold text-xs">
      {num}
    </span>
    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-600 mb-2">{desc}</p>
    {children}
  </li>
);
