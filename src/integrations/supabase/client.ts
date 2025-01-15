import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qqmwyaazsozedazrvmfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbXd5YWF6c296ZWRhenJ2bWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU0ODc3NzcsImV4cCI6MjAyMTA2Mzc3N30.XB3_7ZYAFmABOVUqKqQyv4R7dHmkEkpXTuqDEMwS7Qo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});