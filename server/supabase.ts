import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// In development, allow missing Supabase credentials with a warning
const isDevelopment = process.env.NODE_ENV === 'development';

if (!supabaseUrl || !supabaseAnonKey) {
  if (isDevelopment) {
    console.warn('⚠️  Missing Supabase environment variables!');
    console.warn('   Add to your .env file:');
    console.warn('   - SUPABASE_URL=https://your-project.supabase.co');
    console.warn('   - SUPABASE_ANON_KEY=your-anon-key');
    console.warn('   - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional)');
    console.warn('   See .env.example for details.');
  } else {
    throw new Error('Missing required Supabase environment variables in production');
  }
}

// Regular client for user-scoped operations
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client with service role key - bypasses RLS for admin operations
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;
