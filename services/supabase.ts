import { createClient } from '@supabase/supabase-js';
import { ServiceProvider, Recommendation } from '../types.ts';

// These should ideally be environment variables in Cloudflare dashboard
const SUPABASE_URL = 'https://lkjndtyqrtqribltkgek.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HGhl37lpKU_8vomSWct-4A_gKnjnWxK';

export const getSupabaseClient = () => {
  // A valid Supabase key is a long JWT. If it starts with 'sb_', it's a placeholder.
  const isInvalidKey = !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.startsWith('sb_') || SUPABASE_ANON_KEY.length < 50;
  
  if (!SUPABASE_URL || isInvalidKey) {
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
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        recommendations (*)
      `);

    if (error) {
      console.error('Database query error:', error);
      return [];
    }

    return (data || []) as ServiceProvider[];
  } catch (err) {
    console.error('Connection failed:', err);
    return [];
  }
};

export const upsertProvider = async (provider: Partial<ServiceProvider>, rec: Partial<Recommendation>) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("לא ניתן להתחבר למסד הנתונים כרגע.");

  // Using name and phone as unique identifier to avoid duplicates
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

  if (pError || !pData) throw pError;

  const { error: rError } = await supabase
    .from('recommendations')
    .insert({
      provider_id: pData.id,
      recommender_name: rec.recommenderName || 'שכנה',
      comment: rec.comment || 'מומלץ בחום!',
      date: rec.date || new Date().toISOString().split('T')[0]
    });

  if (rError) throw rError;
  
  return pData;
};
