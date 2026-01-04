import { createClient } from '@supabase/supabase-js';
import { ServiceProvider, Recommendation } from '../types.ts';

// ה-URL של הפרויקט שלך ב-Supabase
const SUPABASE_URL = 'https://lkjndtyqrtqribltkgek.supabase.co';

// ה-Anon Key התקין שסיפקת
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxram5kdHlxcnRxcmlibHRrZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDE5MTIsImV4cCI6MjA4MjY3NzkxMn0.9KlAYK4RAMAUVUSGPaC3fJ8d7Fz5l9XiAVCbscWljac'; 

export const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('YOUR_ACTUAL')) {
    console.warn("Supabase keys are not fully configured.");
    return null;
  }
  
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.error("Supabase initialization failed:", e);
    return null;
  }
};

export const fetchProviders = async (): Promise<ServiceProvider[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        recommendations (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database query error:', error.message);
      return [];
    }

    return (data || []).map(p => ({
      ...p,
      recommendations: (p.recommendations || []).map((r: any) => ({
        id: r.id,
        recommenderName: r.recommender_name,
        comment: r.comment,
        date: r.date
      }))
    })) as ServiceProvider[];
  } catch (err) {
    console.error('Connection failed:', err);
    return [];
  }
};

export const upsertProvider = async (provider: Partial<ServiceProvider>, rec: Partial<Recommendation>) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("לא ניתן להתחבר למסד הנתונים. ודא שהמפתח הוגדר כראוי.");

  // 1. שמירה/עדכון של נותן השירות
  const { data: pData, error: pError } = await supabase
    .from('providers')
    .upsert({
      name: provider.name,
      category: provider.category,
      phone: provider.phone,
      description: provider.description
    }, { onConflict: 'name,phone' })
    .select()
    .single();

  if (pError || !pData) {
    console.error("Upsert provider error:", pError);
    throw new Error(pError?.message || "שגיאה בשמירת נותן השירות");
  }

  // 2. שמירת ההמלצה המשויכת
  const { error: rError } = await supabase
    .from('recommendations')
    .insert({
      provider_id: pData.id,
      recommender_name: rec.recommenderName || 'שכנה',
      comment: rec.comment || 'מומלץ בחום!',
      date: rec.date || new Date().toISOString().split('T')[0]
    });

  if (rError) {
    console.error("Insert recommendation error:", rError);
    throw new Error(rError.message);
  }
  
  return pData;
};
