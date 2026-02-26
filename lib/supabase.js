import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

export function getSupabase() {
  if (supabase) return supabase;
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠ Supabase no configurado — usando modo demo');
    return null;
  }
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  return supabase;
}
