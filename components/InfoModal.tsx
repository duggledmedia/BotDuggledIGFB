import React, { useState } from 'react';
import { X, Server, CheckCircle, Instagram, Rocket, AlertTriangle, Key } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'env'>('deploy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Rocket size={24} />
            Puesta en Marcha
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'deploy' ? 'bg-white text-blue-600 border-t-2 border-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Server size={16} /> Checklist Vercel
          </button>
          <button 
            onClick={() => setActiveTab('env')}
            className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'env' ? 'bg-white text-blue-600 border-t-2 border-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Key size={16} /> Variables
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-white">
          
          {/* TAB 1: CHECKLIST */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                <p className="text-sm text-green-800 font-medium">
                  ¡Listo! He creado el archivo <code>api/webhook.js</code> automáticamente en tu proyecto.
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Ya no necesitas programar nada. Solo sigue estos pasos para conectarlo.
                </p>
              </div>

              <div className="space-y-4">
                <Step 
                  num="1" 
                  title="Subir a Vercel" 
                  desc="Sube este código a tu repositorio (GitHub/GitLab) e impórtalo en Vercel." 
                />
                <Step 
                  num="2" 
                  title="Configurar Variables" 
                  desc="En Vercel (Settings > Environment Variables), agrega las 3 claves de la pestaña 'Variables'." 
                />
                <Step 
                  num="3" 
                  title="Obtener URL del Webhook" 
                  desc="Una vez desplegado, tu URL será:" 
                >
                  <code className="block mt-2 bg-slate-900 text-white p-2 rounded text-xs text-center">
                    https://tu-proyecto.vercel.app/api/webhook
                  </code>
                </Step>
                <Step 
                  num="4" 
                  title="Pegar en Meta" 
                  desc="Ve a Meta Developers > Webhooks > Instagram. Pega la URL y tu Token de Verificación." 
                />
              </div>
            </div>
          )}

          {/* TAB 2: VARIABLES */}
          {activeTab === 'env' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Estas son las 3 variables que debes agregar en Vercel para que el bot funcione.
              </p>

              <div className="space-y-3">
                <EnvVar 
                  name="API_KEY" 
                  desc="Tu clave de Google Gemini (AI Studio)."
                  example="AIzaSy..."
                />
                <EnvVar 
                  name="IG_ACCESS_TOKEN" 
                  desc="El token largo que generaste en Meta Developers."
                  example="EAA..."
                />
                <EnvVar 
                  name="VERIFY_TOKEN" 
                  desc="Una contraseña inventada por vos. Debe coincidir con la que pongas en Meta."
                  example="DuggledSecret123"
                />
              </div>

              <div className="mt-6 bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex gap-2">
                <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
                <p className="text-xs text-yellow-800">
                  <strong>Atención:</strong> Si cambias el <code>VERIFY_TOKEN</code> en Vercel, debes volver a verificar el Webhook en Meta.
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
const Step = ({ num, title, desc, children }: { num: string, title: string, desc: string, children?: React.ReactNode }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
      {num}
    </div>
    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
      {children}
    </div>
  </div>
);

const EnvVar = ({ name, desc, example }: { name: string, desc: string, example: string }) => (
  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
    <div className="flex items-center justify-between mb-1">
      <code className="text-sm font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
        {name}
      </code>
    </div>
    <p className="text-xs text-gray-600 mb-2">{desc}</p>
    <div className="text-[10px] text-gray-400 font-mono bg-white p-1 rounded border border-gray-100 truncate">
      Ej: {example}
    </div>
  </div>
);
