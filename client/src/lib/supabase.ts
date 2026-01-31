import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;

async function initSupabase(): Promise<SupabaseClient> {
  if (supabaseInstance) return supabaseInstance;
  
  const response = await fetch('/api/config');
  const config = await response.json();
  
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
  return supabaseInstance;
}

export function getSupabase(): Promise<SupabaseClient> {
  if (!initPromise) {
    initPromise = initSupabase();
  }
  return initPromise;
}

export function getSupabaseSync(): SupabaseClient | null {
  return supabaseInstance;
}
