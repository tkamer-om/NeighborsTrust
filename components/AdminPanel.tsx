import React, { useState } from 'react';
import { magicParseRecommendation } from '../services/gemini.ts';
import { upsertProvider } from '../services/supabase.ts';

interface AdminPanelProps {
  onClose: () => void;
  onRefresh: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onRefresh }) => {
  const [bulkText, setBulkText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [status, setStatus] = useState('');

  const handleProcess = async () => {
    if (!bulkText.trim()) return;
    setIsProcessing(true);
    setStatus('מנתחת את ההיסטוריה... זה עשוי לקחת כמה שניות');
    try {
      const parsed = await magicParseRecommendation(bulkText);
      setResults(parsed);
      setStatus(`מצאתי ${parsed.length} המלצות! בדקי אותן לפני השמירה לענן.`);
    } catch (e) {
      setStatus('שגיאה בניתוח הטקסט.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAll = async () => {
    if (!results) return;
    setIsProcessing(true);
    setStatus('שומרת לענן הקהילתי...');
    try {
      for (const item of results) {
        await upsertProvider(
          { name: item.providerName, category: item.category, phone: item.phone, description: item.contextDescription },
          { recommenderName: item.recommenderName, comment: item.comment }
        );
      }
      setStatus('הכל נשמר בהצלחה!');
      setTimeout(() => {
        setResults(null);
        setBulkText('');
        onRefresh();
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      setStatus('שגיאה בשמירה לענן. ודאי שהגדרות ה-Supabase מוגדרות במערכת.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-800 p-8 text-white">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-2xl font-black">ייבוא המלצות לקהילה</h3>
              <p className="text-slate-400 text-sm italic">הפוך את הודעות הווטסאפ למאגר חכם</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {!results ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">הדביקי כאן הודעות מהקבוצה</label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-slate-100 transition-all text-sm font-medium resize-none"
                  placeholder="למשל: 'יוסי האינסטלטור מומלץ מאוד! 052-1234567'"
                />
              </div>
              <button
                onClick={handleProcess}
                disabled={isProcessing || !bulkText.trim()}
                className="w-full py-4 bg-rose-400 text-white font-bold rounded-2xl shadow-xl hover:bg-rose-500 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'מנתחת נתונים...' : 'התחילי ניתוח AI ✨'}
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="max-h-96 overflow-y-auto space-y-3 no-scrollbar pr-2">
                {results.map((r, i) => (
                  <div key={i} className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex justify-between items-center animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 50}ms` }}>
                    <div>
                      <p className="font-bold text-slate-800">{r.providerName}</p>
                      <p className="text-[10px] text-rose-400 font-black">{r.category} | {r.phone}</p>
                    </div>
                    <div className="text-left max-w-[50%]">
                      <p className="text-[10px] text-slate-500 italic line-clamp-1">"{r.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setResults(null)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">ביטול</button>
                <button onClick={handleSaveAll} className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-600 transition-all">שמירה לכולן בענן ☁️</button>
              </div>
            </div>
          )}
          {status && <p className="text-center text-xs font-bold text-rose-400 animate-pulse">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
