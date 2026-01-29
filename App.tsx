import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Info, Volume2, Loader2, Sparkles, Phone, Video, ArrowLeft, Instagram } from 'lucide-react';
import { generateBotResponse, generateSpeech } from './services/geminiService';
import { AudioRecorder } from './components/AudioRecorder';
import { InfoModal } from './components/InfoModal';
import { Message } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'model',
      text: "¡Hola! 👋 Soy el asistente de Duggled en Instagram. 🤖🇦🇷 ¿En qué te puedo ayudar hoy con tu web o marketing?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    await processBotResponse([...messages, userMsg], undefined);
  };

  const handleAudioInput = async (base64Audio: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: "🎤 Audio enviado",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    await processBotResponse([...messages, userMsg], base64Audio);
  };

  const processBotResponse = async (history: Message[], audioInput?: string) => {
    setIsProcessing(true);
    
    // Add temporary loading message
    const loadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'model',
      text: "",
      isProcessing: true,
      timestamp: new Date()
    }]);

    try {
      const botText = await generateBotResponse(history, audioInput);
      
      let audioUrl: string | undefined = undefined;
      
      if (audioInput) {
        const generatedAudio = await generateSpeech(botText);
        if (generatedAudio) {
            audioUrl = generatedAudio;
        }
      }

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== loadingId);
        return [...filtered, {
          id: Date.now().toString(),
          role: 'model',
          text: botText,
          audioUrl: audioUrl,
          timestamp: new Date()
        }];
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="flex justify-center bg-black h-screen">
      {/* Mobile container simulation */}
      <div className="w-full max-w-md bg-white h-full flex flex-col relative shadow-2xl overflow-hidden md:rounded-3xl md:h-[95vh] md:mt-[2.5vh] md:border-8 md:border-gray-900">
        
        {/* Instagram Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <ArrowLeft className="text-black cursor-pointer" size={24} />
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                   <div className="w-full h-full bg-white rounded-full p-[2px]">
                      <img 
                        src="https://api.dicebear.com/7.x/bottts/svg?seed=duggled" 
                        alt="Duggled" 
                        className="w-full h-full rounded-full bg-gray-200 object-cover"
                      />
                   </div>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm flex items-center gap-1">
                  duggled.mkt <span className="text-blue-500 text-[10px] ml-1">✓</span>
                </span>
                <span className="text-xs text-gray-500">Activo ahora</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 text-gray-800">
            <Phone size={24} />
            <Video size={24} />
            <Info 
                size={24} 
                className="cursor-pointer text-blue-500 hover:text-blue-600"
                onClick={() => setShowInfo(true)}
            />
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide">
          {/* Timestamp helper */}
          <div className="text-center text-xs text-gray-400 my-4">Hoy {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                 <div className="w-7 h-7 rounded-full overflow-hidden mr-2 mt-auto mb-1">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=duggled" alt="Bot" className="w-full h-full bg-gray-100" />
                 </div>
              )}
              
              <div className={`max-w-[75%] px-4 py-3 text-[15px] leading-snug break-words ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-[22px] rounded-br-sm' 
                  : 'bg-gray-100 text-black rounded-[22px] rounded-bl-sm border border-gray-200'
              }`}>
                {msg.isProcessing ? (
                  <div className="flex gap-1 h-5 items-center px-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Audio Player for Bot Response */}
                    {msg.audioUrl && (
                      <button 
                        onClick={() => playAudio(msg.audioUrl!)}
                        className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl w-full transition ${
                            msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        <Volume2 size={16} />
                        <span className="text-xs font-medium">Escuchar Audio</span>
                        <div className="flex gap-0.5 items-center h-3 ml-auto">
                            {[1,2,3,4,5,3,4,2].map((h, i) => (
                                <div key={i} className={`w-0.5 rounded-full ${msg.role === 'user' ? 'bg-white/70' : 'bg-gray-500'}`} style={{height: `${h*2}px`}}></div>
                            ))}
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Instagram Footer Input */}
        <footer className="bg-white p-3 pb-5 flex items-center gap-3">
          <div className="bg-gray-100 rounded-full flex items-center flex-1 px-1 py-1 pr-2 border border-gray-200">
             <div className="p-1">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer">
                    <span className="font-bold text-xs">📷</span>
                </div>
             </div>
             <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Envía un mensaje..."
                className="bg-transparent border-none focus:ring-0 w-full text-sm resize-none max-h-24 py-2 px-2 placeholder-gray-500 scrollbar-hide"
                rows={1}
                disabled={isProcessing}
              />
              {!inputText.trim() && (
                 <div className="flex gap-2 text-gray-800 pr-2">
                    <AudioRecorder onAudioRecorded={handleAudioInput} disabled={isProcessing} />
                 </div>
              )}
          </div>
          
          {inputText.trim() && (
             <button
              onClick={handleSendMessage}
              disabled={isProcessing}
              className="text-blue-500 font-semibold text-sm hover:text-blue-700 transition"
             >
                Enviar
             </button>
          )}
           {!inputText.trim() && (
              <>
                 <Sparkles className="text-gray-800 cursor-pointer" size={24} />
              </>
           )}
        </footer>

        {/* Modals */}
        <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
        
        {/* Background decorative elements for desktop view */}
        <div className="hidden md:block absolute -right-20 top-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px] -z-10 opacity-50"></div>
        <div className="hidden md:block absolute -left-20 bottom-20 w-64 h-64 bg-pink-500 rounded-full blur-[100px] -z-10 opacity-50"></div>
      </div>
    </div>
  );
}

export default App;
