import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Download } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

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

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-teal-600 text-white shadow-md z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">AI Соц-Аналітик</h3>
            <p className="text-[10px] text-teal-100 opacity-90">Українська версія</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleDownloadTranscript}
            title="Зберегти транскрипт чату"
            className="p-1.5 hover:bg-teal-700 rounded text-white/80 hover:text-white transition"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-teal-700 rounded text-white/80 hover:text-white transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                {msg.role === 'model' ? <Bot size={12} /> : <User size={12} />}
                <span>{msg.role === 'model' ? 'AI Помічник' : 'Ви'}</span>
              </div>
              <div dangerouslySetInnerHTML={{ 
                __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span className="text-xs text-slate-500">Аналізую дані...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишіть ваше запитання..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};