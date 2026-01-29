import React, { useState } from 'react';
import { X, Server, Lock, Key, ShieldCheck, Instagram, Globe, Code, CheckCircle } from 'lucide-react';

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
            <ShieldCheck size={16} /> Requisitos
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
            <Code size={16} /> Código Server
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-white">
          
          {/* TAB 1: REQUISITOS */}
          {activeTab === 'req' && (
            <div className="space-y-6">
               <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Concepto Clave:</strong> Instagram no envía los mensajes a tu navegador. Los envía a un servidor (Backend) que tú controlas. Ese servidor usa Gemini para pensar y le responde a Instagram.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ReqItem 
                  title="Cuenta Empresarial"
                  desc="Instagram Business vinculado a una Fan Page de Facebook."
                  icon={<Instagram className="w-5 h-5 text-pink-600" />}
                />
                <ReqItem 
                  title="Meta Developer App"
                  desc="Crear App en developers.facebook.com (Tipo: Negocios)."
                  icon={<Key className="w-5 h-5 text-yellow-600" />}
                />
                <ReqItem 
                  title="Servidor HTTPS"
                  desc="Un endpoint público (ej: railway.app, render.com) con SSL."
                  icon={<Server className="w-5 h-5 text-blue-600" />}
                />
                <ReqItem 
                  title="Permisos"
                  desc="instagram_manage_messages, pages_messaging."
                  icon={<Lock className="w-5 h-5 text-purple-600" />}
                />
              </div>
            </div>
          )}

          {/* TAB 2: WEBHOOK */}
          {activeTab === 'webhook' && (
            <div className="space-y-6 text-sm text-gray-700">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Paso a paso en Meta Developers:</h3>
              
              <ol className="relative border-l border-gray-200 ml-3 space-y-8">
                <Step 
                  num="1" 
                  title="Agregar Producto" 
                  desc="En el panel lateral de tu App, busca 'Agregar productos' y selecciona 'Webhooks'."
                />
                <Step 
                  num="2" 
                  title="Configurar Objeto" 
                  desc="En la página de Webhooks, verás un menú desplegable. Selecciona 'Instagram' (NO selecciones Page)."
                />
                <Step 
                  num="3" 
                  title="Suscribirse" 
                  desc="Haz clic en 'Edit Subscription' (o Suscribirse). Te pedirá dos datos:"
                >
                  <ul className="mt-2 space-y-1 text-xs bg-gray-50 p-2 rounded border border-gray-200">
                    <li><strong>Callback URL:</strong> La URL de tu servidor + /webhook (ej: <code>https://mi-api.com/webhook</code>)</li>
                    <li><strong>Verify Token:</strong> Una contraseña que inventes (ej: <code>DuggledSecret123</code>). Debe coincidir con tu código.</li>
                  </ul>
                </Step>
                <Step 
                  num="4" 
                  title="Seleccionar Campos" 
                  desc="Una vez verificado, aparecerá una lista de campos. Busca y suscríbete a 'messages' y 'messaging_postbacks'."
                />
              </ol>
            </div>
          )}

          {/* TAB 3: CODIGO */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Copia este código en un archivo <code>index.js</code>. Instala dependencias con: <br/>
                <code className="bg-gray-100 px-1 rounded">npm install express body-parser axios dotenv @google/genai</code>
              </p>

              <div className="relative group">
                <div className="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition">Node.js</div>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre">
{`const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require("@google/genai");
const app = express();

app.use(bodyParser.json());

// CONFIGURACIÓN
const VERIFY_TOKEN = 'DuggledSecret123'; // Lo que pusiste en Meta
const IG_TOKEN = process.env.IG_ACCESS_TOKEN; // Token de la Page
const GENAI_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: GENAI_KEY });

// 1. VERIFICACIÓN DEL WEBHOOK (Meta llama aquí primero)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFICADO');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. RECIBIR MENSAJES
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'instagram') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        if (event.message && event.message.text) {
          const senderId = event.sender.id;
          const userText = event.message.text;

          // LLAMAR A GEMINI
          const response = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: userText,
             config: { systemInstruction: "Sos el bot de Duggled..." }
          });
          
          const botText = response.text;

          // RESPONDER A INSTAGRAM
          await sendInstagramMessage(senderId, botText);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function sendInstagramMessage(recipientId, text) {
  // Lógica con axios a graph.facebook.com/v18.0/me/messages
}

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Subcomponents for cleaner code
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
