import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Download, Type, Eye, RefreshCw } from 'lucide-react';
import { analyzeData } from '../services/geminiService';
import { Organization, ChatMessage } from '../types';

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
      text: 'Вітаю! Я ваш AI-консультант. Я допоможу знайти притулок, гуманітарну допомогу або контакти волонтерів в Одесі, Миколаєві та Херсоні. Що вас цікавить?',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLargeText]);

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

  const handleDownloadTranscript = () => {
    if (messages.length <= 1) return;
    
    const textContent = messages
      .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'model' ? 'AI Консультант' : 'Користувач'}:\n${m.text}\n`)
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

  const headerClass = isHighContrast
    ? 'bg-slate-900 border-b-2 border-yellow-400 text-yellow-400'
    : 'bg-teal-600 border-b border-slate-100 text-white';

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

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${containerClass}`}>
      {/* Header */}
      <div className={`p-4 flex flex-col gap-3 shadow-md z-10 ${headerClass}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-6 h-6 ${isHighContrast ? 'text-yellow-400' : ''}`} />
            <div>
              <h3 className="font-bold text-lg">пане Помічник</h3>
              <div className="flex items-center gap-2 mt-0.5">
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
              className={`p-2 rounded transition ${isHighContrast ? 'hover:bg-yellow-400 hover:text-black' : 'hover:bg-teal-700 text-white/90 hover:text-white'}`}
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              aria-label="Закрити"
              className={`p-2 rounded transition ${isHighContrast ? 'hover:bg-red-600 hover:text-white' : 'hover:bg-teal-700 text-white/90 hover:text-white'}`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Accessibility Toolbar */}
        <div className={`flex items-center justify-between px-2 py-1.5 rounded ${isHighContrast ? 'bg-slate-800 border border-white' : 'bg-teal-700/50'}`}>
           <span className={`text-xs font-medium uppercase ${isHighContrast ? 'text-white' : 'text-teal-50'}`}>Доступність:</span>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsLargeText(!isLargeText)}
                className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold transition ${isLargeText ? (isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white text-teal-700 shadow-sm') : (isHighContrast ? 'text-white hover:bg-slate-700' : 'text-white hover:bg-teal-600')}`}
                title="Змінити розмір шрифту"
                aria-label="Перемикач розміру тексту"
              >
                <Type className="w-4 h-4" />
                <span>{isLargeText ? 'Вел.' : 'Норм.'}</span>
              </button>
              
              <button 
                onClick={() => setIsHighContrast(!isHighContrast)}
                className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold transition ${isHighContrast ? 'bg-yellow-400 text-black' : 'text-white hover:bg-teal-600'}`}
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
              <div className="flex items-center gap-2 mb-1.5 opacity-80 text-xs uppercase font-bold tracking-wider">
                {msg.role === 'model' ? <Bot size={14} /> : <User size={14} />}
                <span>{msg.role === 'model' ? 'пане Помічник' : 'Ви'}</span>
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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишіть ваше запитання..."
            className={`flex-1 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${inputClass} ${textSizeClass} ${isHighContrast ? 'focus:ring-yellow-400' : 'focus:ring-teal-500'}`}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
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