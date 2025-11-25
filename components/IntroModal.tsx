import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Volume2, VolumeX, Play, CheckCircle } from 'lucide-react';

interface IntroModalProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    title: "Вітаємо на Мапі соціальних послуг!",
    text: "Це ваш надійний навігатор для пошуку допомоги у південному регіоні України. Ми об'єднали інформацію про перевірені благодійні фонди, притулки та волонтерські центри.",
  },
  {
    title: "Як це працює?",
    text: "Ви можете переглядати організації на інтерактивній мапі, шукати їх у списку або фільтрувати за категоріями послуг, які вам необхідні саме зараз.",
  },
  {
    title: "Голосова помічниця пані Думка",
    text: "Натисніть кнопку «Помічниця», щоб поспілкуватися з нашим штучним інтелектом. Ви можете просто сказати, що вам потрібно, і пані Думка знайде відповідні контакти.",
  },
  {
    title: "Почнімо роботу",
    text: "Оберіть свій регіон — Одеська, Миколаївська чи Херсонська область — і ми покажемо найближчі до вас пункти допомоги.",
  }
];

export const IntroModal: React.FC<IntroModalProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  // Ref to handle speech synthesis cancellation
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle slide changes - trigger speech if playing
  useEffect(() => {
    if (hasStarted && isPlaying) {
      speak(SLIDES[currentStep].text);
    }
  }, [currentStep]); // Removed isPlaying/hasStarted to prevent double-triggering

  const speak = (text: string) => {
    // Always cancel before speaking new text
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uk-UA'; 
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Ukrainian -> Russian (often handles UK well) -> Default
    const targetVoice = voices.find(v => v.lang.includes('uk')) || 
                        voices.find(v => v.lang.includes('ru'));
    
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
    // Speak immediately on user interaction
    speak(SLIDES[currentStep].text);
  };

  const handleNext = () => {
    if (currentStep < SLIDES.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    window.speechSynthesis.cancel();
    handleFinish();
  };

  const handleFinish = () => {
    window.speechSynthesis.cancel();
    if (dontShowAgain) {
      localStorage.setItem('hide_intro_annotation', 'true');
    }
    onComplete();
  };

  const toggleMute = () => {
    if (isPlaying) {
      // Mute
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Unmute and Speak
      setIsPlaying(true);
      speak(SLIDES[currentStep].text);
    }
  };

  const content = SLIDES[currentStep];
  const isLastSlide = currentStep === SLIDES.length - 1;

  return (
    // High Z-index to cover everything
    <div className="fixed inset-0 z-[5000] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header Image */}
        <div className="h-32 bg-teal-600 bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-teal-900/40"></div>
          <div className="absolute bottom-4 left-6 text-white z-10">
            <h2 className="text-2xl font-bold drop-shadow-md">{content.title}</h2>
          </div>
          
          <button 
            onClick={toggleMute}
            className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white backdrop-blur-sm transition-all"
            title={isPlaying ? "Вимкнути звук" : "Увімкнути звук"}
          >
            {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          
          {/* Main Text Area */}
          <div className="min-h-[120px] text-lg text-slate-700 leading-relaxed relative flex items-center">
             {!hasStarted ? (
               <div className="w-full flex flex-col items-center justify-center gap-4 py-2 text-center">
                 <p>Натисніть кнопку, щоб прослухати аудіо-гід.</p>
                 <button 
                   onClick={handleStart}
                   className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                 >
                   <Play size={20} fill="currentColor" /> Розпочати тур
                 </button>
               </div>
             ) : (
                <p className="animate-in fade-in duration-500 w-full">
                  {content.text}
                </p>
             )}
          </div>

          {/* Progress Dots */}
          <div className="flex gap-2 justify-center">
            {SLIDES.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-teal-600' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
             <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-slate-700 select-none">
               <input 
                 type="checkbox" 
                 checked={dontShowAgain}
                 onChange={(e) => setDontShowAgain(e.target.checked)}
                 className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
               />
               <span>Більше не показувати</span>
             </label>

             <div className="flex items-center gap-3">
               {!isLastSlide && (
                 <button 
                   onClick={handleSkip}
                   className="px-4 py-2 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                 >
                   Пропустити
                 </button>
               )}
               
               {hasStarted && (
                 <button 
                   onClick={handleNext}
                   className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors shadow-md"
                 >
                   {isLastSlide ? 'Почати роботу' : 'Далі'}
                   {!isLastSlide ? <ArrowRight size={18} /> : <CheckCircle size={18} />}
                 </button>
               )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};