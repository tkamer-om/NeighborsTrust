import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_DATA } from './constants.tsx';
import { ServiceProvider, Recommendation } from './types.ts';
import ChatInterface from './components/ChatInterface.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import Assistant from './components/Assistant.tsx';
import { fetchProviders } from './services/supabase.ts';

const App: React.FC = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const cloudData = await fetchProviders();
      // If we got real data from the cloud, use it. Otherwise, fallback to initial samples.
      if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
        setProviders(cloudData);
      } else {
        setProviders(INITIAL_DATA);
      }
    } catch (e) {
      console.error("Cloud fetch failed, using initial data", e);
      setProviders(INITIAL_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const recentRecommendations = useMemo(() => {
    const allRecs: (Recommendation & { 
      providerName: string; 
      providerCategory: string; 
    })[] = [];
    
    if (Array.isArray(providers)) {
      providers.forEach(p => {
        if (p && Array.isArray(p.recommendations)) {
          p.recommendations.forEach(r => {
            if (r) {
              allRecs.push({
                ...r,
                providerName: String(p.name || 'לא ידוע'),
                providerCategory: String(p.category || 'כללי'),
              });
            }
          });
        }
      });
    }

    return allRecs
      .sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [providers]);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 flex flex-col font-['Assistant'] selection:bg-rose-100">
      {/* Action Button - Main way to add content */}
      <button 
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[60] p-4 rounded-full shadow-2xl bg-rose-400 text-white hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border-4 border-white active-scale"
        title="הוספת המלצה"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-bold text-sm ml-1 hidden md:inline">הוספת המלצה</span>
      </button>

      <header className="bg-rose-300 text-white pt-12 pb-32 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">שכנות ממליצות</h1>
          <p className="text-rose-50 text-md md:text-lg opacity-90 font-medium italic">המדריך הקהילתי שלכן לשירותים מעולים</p>
          
          <div className="mt-8 flex justify-center">
             {isLoading ? (
               <div className="flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full border border-white/20 backdrop-blur-md">
                 <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold uppercase tracking-wider">טוענת את המדריך...</span>
               </div>
             ) : (
               <div className="bg-emerald-400/20 backdrop-blur-sm px-6 py-2 rounded-full border border-emerald-400/30 flex items-center gap-2 shadow-inner">
                 <span className="text-xs font-bold text-white">
                   {providers.length} נותני שירות במאגר הקהילתי
                 </span>
               </div>
             )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-rose-400/20 rounded-full blur-2xl"></div>
      </header>

      <main className="max-w-3xl w-full mx-auto px-4 -mt-20 relative z-20 flex-grow pb-24">
        {/* AI Chat Search - The primary interface */}
        <ChatInterface providers={providers} />
        
        {/* Recent Recommendations Feed */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
              <span className="w-12 h-[1.5px] bg-rose-200"></span>
              המלצות אחרונות
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {recentRecommendations.length > 0 ? (
              recentRecommendations.map((rec) => (
                <div 
                  key={rec.id || Math.random().toString()} 
                  className="bg-white p-5 rounded-[2rem] shadow-sm border border-rose-50 flex flex-col hover:shadow-xl hover:border-rose-100 transition-all duration-300 group animate-fade-in"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-extrabold text-rose-400 bg-rose-50/50 px-3 py-1 rounded-full border border-rose-100/50 uppercase tracking-tighter">
                      {String(rec.providerCategory)}
                    </span>
                    <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{String(rec.date || '')}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-800 group-hover:text-rose-500 transition-colors">{String(rec.providerName)}</h4>
                  <p className="text-sm text-slate-500 italic mt-3 line-clamp-3 leading-relaxed">
                    "{String(rec.comment || '')}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-rose-50/50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-400">
                      {String(rec.recommenderName || 'ש').charAt(0)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{String(rec.recommenderName || 'שכנה')} ממליצה</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-300 italic">
                עדיין אין המלצות במאגר. תהיי הראשונה להוסיף!
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-12 text-center">
         <div className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">
           שכנות ממליצות • המרחב הקהילתי שלכן • 2025
         </div>
      </footer>

      {/* Persistent AI Assistant floating button */}
      <Assistant data={providers} />
      
      {/* Overlay Modals */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} onRefresh={loadData} />}
    </div>
  );
};

export default App;