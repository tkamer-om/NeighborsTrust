import React, { useState } from 'react';
import { searchWithAI } from '../services/gemini';
import { ServiceProvider } from '../types';

interface AssistantProps {
  data: ServiceProvider[];
}

const Assistant: React.FC<AssistantProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse('');
    try {
      const result = await searchWithAI(query, data);
      setResponse(result.text);
    } catch (error) {
      setResponse("מצטערת, לא הצלחתי לעבד את הבקשה. נסי לשאול על שירות ספציפי!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col items-start">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-rose-300 p-5 flex justify-between items-center text-white">
            <h4 className="font-bold flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              העוזרת החכמה שלך
            </h4>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-3 no-scrollbar">
              {!response && !isLoading && (
                <p className="text-slate-400 text-xs text-center py-4 italic">איך אוכל לעזור היום? שאלי אותי למשל "מי מומלץ לעיצוב שיער?"</p>
              )}
              {response && (
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-xs text-slate-700 leading-relaxed shadow-sm">
                  {response}
                </div>
              )}
              {isLoading && (
                <div className="flex justify-center py-6">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="שאלי אותי..."
                className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-4 focus:ring-rose-300/10 outline-none"
              />
              <button
                onClick={handleAsk}
                disabled={isLoading}
                className="p-2.5 bg-rose-300 text-white rounded-xl hover:bg-rose-400 disabled:opacity-50 transition-all shadow-md"
              >
                <svg className="w-4 h-4 transform scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-rose-300 text-white rounded-2xl shadow-xl hover:shadow-rose-100 flex items-center justify-center transition-all hover:scale-110 active:scale-90 relative"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-300"></span>
        </span>
      </button>
    </div>
  );
};

export default Assistant;
