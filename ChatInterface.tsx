import React, { useState, useRef, useEffect } from 'react';
import { searchWithAI } from '../services/gemini.ts';
import { ServiceProvider } from '../types.ts';
import ServiceCard from './ServiceCard.tsx';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedProviders?: ServiceProvider[];
}

interface ChatInterfaceProps {
  providers: ServiceProvider[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ providers }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'היי! אני העוזרת החכמה של השכונה. את מי את מחפשת היום? (למשל: אינסטלטור אמין, מורה למתמטיקה או מעצבת שיער)'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await searchWithAI(input, providers);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        recommendedProviders: providers.filter(p => result.recommendedIds.includes(p.id))
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'אופס, משהו השתבש בחיפוש. נסי לשאול שוב בצורה אחרת!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-5 space-y-4 no-scrollbar bg-slate-50/20"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-rose-400 text-white rounded-tr-none' 
                  : 'bg-white border border-stone-100 text-slate-700 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
              
              {msg.recommendedProviders && msg.recommendedProviders.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {msg.recommendedProviders.map(p => (
                    <ServiceCard key={p.id} provider={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white border border-stone-100 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-rose-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="מה תרצי למצוא?"
          className="flex-grow py-3 px-5 bg-stone-50 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-rose-100 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="bg-rose-400 hover:bg-rose-500 text-white p-3 rounded-2xl disabled:opacity-50 transition-colors shadow-md"
        >
          <svg className="w-5 h-5 transform scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;