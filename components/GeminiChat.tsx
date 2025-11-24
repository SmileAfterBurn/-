import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Loader2, Download, Type, Eye, Mic, MicOff } from 'lucide-react';
import { analyzeData, LiveSession } from '../services/geminiService';
import { Organization, ChatMessage } from '../types';

// TODO: Replace this URL with your specific image URL to use "your image"
// Currently using a professional photo placeholder for "Pani Dumka"
const PANI_DUMKA_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop";

interface GeminiChatProps {
  organizations: Organization[];
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ organizations, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Вітаю! Я пані Думка. Я допоможу знайти притулок, гуманітарну допомогу або контакти волонтерів в Одесі, Миколаєві та Херсоні. Що вас цікавить?',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  // Voice Chat State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const liveSessionRef = useRef<LiveSession | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLargeText]);

  // Clean up voice session on unmount
  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await analyzeData(input, organizations);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceChat = async () => {
    if (isVoiceActive) {
      // Stop
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
        liveSessionRef.current = null;
      }
    } else {
      // Start
      liveSessionRef.current = new LiveSession(organizations, (active) => {
        setIsVoiceActive(active);
      });
      await liveSessionRef.current.connect();
    }
  };

  const handleDownloadTranscript = () => {
    if (messages.length <= 1) return;
    
    const textContent = messages
      .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'model' ? 'пані Думка' : 'Користувач'}:\n${m.text}\n`)
      .join('\n-------------------\n');
      
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-transcript-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  // Dynamic Styles based on Accessibility Settings
  const textSizeClass = isLargeText ? 'text-lg' : 'text-base';
  
  const containerClass = isHighContrast 
    ? 'bg-black text-white border-l-4 border-yellow-400' 
    : 'bg-white text-slate-900 border-l border-slate-200';

  // Header background: Fallback color + Image + Text Contrast Fix
  const headerClass = isHighContrast
    ? 'bg-slate-900 border-b-2 border-yellow-400 text-yellow-400'
    : "bg-teal-700 bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center border-b border-white/20 text-white";

  const messageUserClass = isHighContrast
    ? 'bg-yellow-400 text-black border-2 border-white font-bold'
    : 'bg-teal-600 text-white';

  const messageModelClass = isHighContrast
    ? 'bg-black text-white border-2 border-white font-medium'
    : 'bg-white text-slate-800 border border-slate-100';

  const inputAreaClass = isHighContrast
    ? 'bg-black border-t-2 border-yellow-400'
    : 'bg-white border-t border-slate-100';

  const inputClass = isHighContrast
    ? 'bg-slate-900 text-yellow-400 border-2 border-white placeholder-slate-500'
    : 'bg-slate-50 text-slate-900 border border-slate-200';

  // Strong text shadow for visibility against sky background
  const textShadowClass = !isHighContrast ? 'drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : '';

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${containerClass}`}>
      {/* Header */}
      <div className={`p-4 flex flex-col gap-3 shadow-md z-10 ${headerClass}`}>
        {/* Semi-transparent overlay for better text contrast if image loads */}
        <div className={`absolute inset-0 bg-black/30 pointer-events-none ${isHighContrast ? 'hidden' : 'block'}`}></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div className={`flex items-center gap-3 ${textShadowClass}`}>
            <div className={`w-12 h-12 rounded-full border-2 overflow-hidden flex-shrink-0 bg-white ${isHighContrast ? 'border-yellow-400' : 'border-white'}`}>
              <img src={PANI_DUMKA_AVATAR} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white leading-tight">пані Думка</h3>
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none" role="img" aria-label="Ukraine Flag">🇺🇦</span>
                {isHighContrast && <span className="text-[10px] uppercase font-bold border border-yellow-400 px-1 rounded">Високий контраст</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <button 
              onClick={handleDownloadTranscript}
              title="Зберегти транскрипт чату"
              aria-label="Завантажити чат"
              className={`p-2 rounded transition ${isHighContrast ? 'hover:bg-yellow-400 hover:text-black' : 'hover:bg-white/20 text-white hover:text-white drop-shadow-md'}`}
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              aria-label="Закрити"
              className={`p-2 rounded transition ${isHighContrast ? 'hover:bg-red-600 hover:text-white' : 'hover:bg-white/20 text-white hover:text-white drop-shadow-md'}`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Accessibility Toolbar */}
        <div className={`relative z-10 flex items-center justify-between px-2 py-1.5 rounded ${isHighContrast ? 'bg-slate-800 border border-white' : 'bg-black/40 backdrop-blur-sm border border-white/30'}`}>
           <span className={`text-xs font-medium uppercase ${isHighContrast ? 'text-white' : 'text-white drop-shadow-md'}`}>Доступність:</span>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsLargeText(!isLargeText)}
                className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold transition ${isLargeText ? (isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white text-teal-700 shadow-sm') : (isHighContrast ? 'text-white hover:bg-slate-700' : 'text-white hover:bg-white/20 drop-shadow-sm')}`}
                title="Змінити розмір шрифту"
                aria-label="Перемикач розміру тексту"
              >
                <Type className="w-4 h-4" />
                <span>{isLargeText ? 'Вел.' : 'Норм.'}</span>
              </button>
              
              <button 
                onClick={() => setIsHighContrast(!isHighContrast)}
                className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold transition ${isHighContrast ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/20 drop-shadow-sm'}`}
                title="Режим високого контрасту"
                aria-label="Перемикач контрасту"
              >
                <Eye className="w-4 h-4" />
                <span>Контраст</span>
              </button>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-5 ${isHighContrast ? 'bg-black' : 'bg-slate-50'}`}>
        
        {/* Voice Chat Status Indicator */}
        {isVoiceActive && (
          <div className="sticky top-0 z-20 flex justify-center pb-4">
             <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
                <Mic className="w-4 h-4" />
                <span className="text-sm font-bold">Голосовий чат активний (Слухаю...)</span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
             </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] p-4 rounded-xl shadow-sm leading-relaxed ${textSizeClass} ${
                msg.role === 'user'
                  ? `${messageUserClass} rounded-br-none`
                  : `${messageModelClass} rounded-bl-none`
              }`}
            >
              <div className="flex items-center gap-2 mb-2 opacity-90 text-xs uppercase font-bold tracking-wider">
                {msg.role === 'model' ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-white">
                     <img src={PANI_DUMKA_AVATAR} alt="PD" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <User size={16} />
                )}
                <span className="mt-0.5">{msg.role === 'model' ? 'пані Думка' : 'Ви'}</span>
              </div>
              <div dangerouslySetInnerHTML={{ 
                __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-xl rounded-bl-none shadow-sm flex items-center gap-3 ${messageModelClass}`}>
              <Loader2 className={`w-5 h-5 animate-spin ${isHighContrast ? 'text-white' : 'text-teal-600'}`} />
              <span className={`text-sm font-medium ${isHighContrast ? 'text-white' : 'text-slate-600'}`}>Аналізую запит...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 ${inputAreaClass}`}>
        <div className="flex gap-3">
          {/* Voice Toggle Button */}
          <button
            onClick={toggleVoiceChat}
            className={`p-3 rounded-full transition-all shadow-md flex-shrink-0 flex items-center justify-center
              ${isVoiceActive 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : (isHighContrast ? 'bg-slate-800 text-yellow-400 border border-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300')
              }`}
            title={isVoiceActive ? "Вимкнути голосовий чат" : "Увімкнути голосовий чат"}
          >
            {isVoiceActive ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isVoiceActive} // Disable text input during voice chat to prevent confusion
            placeholder={isVoiceActive ? "Вимкніть голос, щоб писати..." : "Напишіть ваше запитання..."}
            className={`flex-1 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${inputClass} ${textSizeClass} ${isHighContrast ? 'focus:ring-yellow-400' : 'focus:ring-teal-500'}`}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isVoiceActive}
            aria-label="Надіслати повідомлення"
            className={`p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex-shrink-0 ${
               isHighContrast 
               ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-white' 
               : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};