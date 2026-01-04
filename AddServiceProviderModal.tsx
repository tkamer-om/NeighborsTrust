import React, { useState, useRef } from 'react';
import { ServiceCategory, ServiceProvider, Recommendation } from '../types';
import { CATEGORIES } from '../constants';
import { magicParseRecommendation, parseWhatsAppImage } from '../services/gemini';

interface AddServiceProviderModalProps {
  onClose: () => void;
  onSave: (provider: ServiceProvider) => void;
}

const AddServiceProviderModal: React.FC<AddServiceProviderModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.HANDYMAN);
  const [description, setDescription] = useState('');
  const [recComment, setRecComment] = useState('');
  const [recommender, setRecommender] = useState('');
  
  const [magicText, setMagicText] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fillData = (dataArray: any[]) => {
    if (!dataArray || dataArray.length === 0) return;
    const data = dataArray[0];
    if (data.providerName) setName(data.providerName);
    if (data.phone) setPhone(data.phone);
    if (data.comment) setRecComment(data.comment);
    if (data.recommenderName) setRecommender(data.recommenderName);
    if (data.contextDescription) setDescription(data.contextDescription);
    if (data.category && Object.values(ServiceCategory).includes(data.category as ServiceCategory)) {
      setCategory(data.category as ServiceCategory);
    }
  };

  const handleMagicFill = async () => {
    if (!magicText.trim()) return;
    setIsMagicLoading(true);
    try {
      const results = await magicParseRecommendation(magicText);
      if (results && results.length > 0) {
        fillData(results);
        setMagicText('');
      } else {
        alert("לא הצלחתי להבין את הטקסט, נסו להדביק שוב או למלא ידנית.");
      }
    } catch (e) {
      alert("שגיאה בניתוח הטקסט.");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsMagicLoading(true);
    try {
      const results = await parseWhatsAppImage(file);
      if (results && results.length > 0) {
        fillData(results);
        if (results.length > 1) {
          alert(`זיהינו ${results.length} המלצות! מילאנו את הראשונה בטופס.`);
        }
      } else {
        alert("לא הצלחתי לקרוא את התמונה.");
      }
    } catch (err) {
      alert("שגיאה בסריקת התמונה.");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("חובה למלא שם ומספר טלפון");
      return;
    }
    const newProvider: ServiceProvider = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      category,
      description: description || `נותן/ת שירות בתחום ${category}`,
      recommendations: [
        {
          id: Math.random().toString(36).substr(2, 9),
          recommenderName: recommender || 'שכנה',
          comment: recComment || 'מומלץ בחום!',
          date: new Date().toISOString().split('T')[0]
        }
      ]
    };
    onSave(newProvider);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 my-8">
        <div className="bg-rose-300 p-8 text-white flex justify-between items-center relative">
          <div>
            <h3 className="text-2xl font-black">הוספת המלצה חדשה</h3>
            <p className="text-rose-50 text-sm">מוזמנת למלא ידנית או להשתמש בתיבת הקסם</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 border-b border-stone-100 bg-rose-50/30 space-y-4">
          <label className="block text-xs font-bold text-rose-300 uppercase tracking-widest">✨ תיבת הקסם (טקסט או צילום מסך)</label>
          <div className="flex gap-2">
            <input 
              className="flex-1 px-4 py-3 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-300/10 outline-none text-sm" 
              placeholder="הדביקי הודעה מהווטסאפ..."
              value={magicText}
              onChange={e => setMagicText(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleMagicFill}
              disabled={isMagicLoading || !magicText.trim()}
              className="bg-rose-300 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-rose-400 disabled:opacity-50 transition-all"
            >
              ניתוח
            </button>
          </div>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={imageInputRef} 
              onChange={handleImageUpload}
            />
            <button 
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isMagicLoading}
              className="w-full py-3 border border-dashed border-rose-200 rounded-xl text-rose-300 font-bold text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              סריקה מצילום מסך
            </button>
          </div>
          {isMagicLoading && (
            <div className="flex items-center gap-2 justify-center text-rose-300 font-bold animate-pulse">
               <span className="text-xs">מנתחת את הנתונים עבורך...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">שם נותן/ת השירות</label>
              <input 
                required
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-rose-300 outline-none transition-all font-bold" 
                placeholder='למשל: ד"ר שרה ישראלי'
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">מספר טלפון</label>
              <input 
                required
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-rose-300 outline-none transition-all font-bold" 
                placeholder="05x-xxxxxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">קטגוריה</label>
              <select 
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-rose-300 outline-none bg-white font-bold"
                value={category}
                onChange={e => setCategory(e.target.value as ServiceCategory)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">התמחות / תת-קטגוריה</label>
              <input 
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-rose-300 outline-none transition-all" 
                placeholder='למשל: כירורגית שד, צביעת שיער, מתמטיקה 5 יח"ל'
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">מי השכנה הממליצה?</label>
              <input 
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-rose-300 outline-none transition-all" 
                placeholder="שם השכנה (או השאירי ריק)"
                value={recommender}
                onChange={e => setRecommender(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">תוכן ההמלצה</label>
              <textarea 
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-rose-300 outline-none h-24 resize-none transition-all italic text-sm" 
                placeholder="למה כדאי להזמין?"
                value={recComment}
                onChange={e => setRecComment(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-stone-50 rounded-xl transition-all">ביטול</button>
            <button type="submit" className="flex-1 py-3.5 bg-rose-300 text-white font-bold rounded-xl shadow-lg hover:bg-rose-400 transition-all">שמירה למדריך</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceProviderModal;