import React, { useState, useRef } from 'react';
import { magicParseRecommendation as parseWhatsAppText, parseWhatsAppImage } from '../services/gemini';

interface WhatsAppImporterProps {
  onImport: (data: any[]) => void;
}

const WhatsAppImporter: React.FC<WhatsAppImporterProps> = ({ onImport }) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (contentToScan: string) => {
    if (!contentToScan.trim()) return;
    setIsProcessing(true);
    try {
      const results = await parseWhatsAppText(contentToScan);
      setExtractedData(results);
    } catch (error) {
      alert("הסריקה נכשלה. נסי להדביק חלק מהטקסט.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      if (file.type.startsWith('image/')) {
        const results = await parseWhatsAppImage(file);
        if (results && results.length > 0) {
          setExtractedData(results);
        } else {
          alert("לא הצלחתי למצוא המלצות בתמונה.");
        }
      } else {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          await handleScan(content);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      alert("שגיאה בעיבוד הקובץ.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onImport(extractedData);
      setExtractedData(null);
      setText('');
    }
  };

  if (extractedData) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-rose-400 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-800">מצאתי המלצות!</h3>
          <span className="bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full text-xs font-bold border border-rose-100">
            {extractedData.length} נמצאו
          </span>
        </div>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-8 pl-2 no-scrollbar">
          {extractedData.map((item, idx) => (
            <div key={idx} className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg text-slate-800">{item.providerName || 'לא זוהה שם'}</p>
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{item.category}</p>
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 uppercase font-black mb-1">הומלץ על ידי</p>
                  <p className="text-xs font-bold text-slate-700">{item.recommenderName || 'שכנה'}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 italic leading-relaxed">"{item.comment || 'מומלץ בחום'}"</p>
              {item.phone && item.phone !== 'לא צוין' && (
                <p className="text-xs font-bold text-emerald-600 mt-2">📞 {item.phone}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={() => setExtractedData(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-stone-50 rounded-2xl transition-all">ביטול</button>
          <button onClick={handleConfirm} className="flex-1 py-4 bg-rose-400 text-white font-bold rounded-2xl shadow-lg hover:bg-rose-500 transition-all">אישור והוספה</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 p-3 rounded-2xl text-rose-400 border border-rose-100">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">ייבוא מהקבוצה</h3>
            <p className="text-sm text-slate-500">העלי צילום מסך או הדביקי טקסט מהשיחה.</p>
          </div>
        </div>
        
        <input type="file" accept=".txt,image/*" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all border border-stone-200"
        >
          בחירת קובץ/תמונה
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="או פשוט הדביקי כאן את הטקסט..."
        className="w-full h-40 p-5 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-rose-400/10 outline-none text-sm mb-6 resize-none bg-stone-50/30"
      />

      <button
        onClick={() => handleScan(text)}
        disabled={isProcessing || !text.trim()}
        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
          isProcessing ? 'bg-stone-300' : 'bg-rose-400 hover:bg-rose-500'
        }`}
      >
        {isProcessing ? 'מנתחת נתונים...' : 'ניתוח טקסט'}
      </button>
    </div>
  );
};

export default WhatsAppImporter;