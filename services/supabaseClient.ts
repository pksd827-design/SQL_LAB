import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key.
// You can find these in your Supabase project settings under "API".
// 1. Go to https://supabase.com/dashboard/projects
// 2. Select your project (or create a new one).
// 3. Go to Project Settings > API.
// 4. Copy the Project URL and the anon Public key.
// FIX: Add explicit string types to prevent TypeScript from inferring literal types,
// which causes an "unintentional comparison" error on line 12 when checking against placeholder values.
export const supabaseUrl: string = 'https://vzoudfchnzvtpwbsunha.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6b3VkZmNobnp2dHB3YnN1bmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDE3ODIsImV4cCI6MjA3MzAxNzc4Mn0.RaecMBtmBBTljETGljc8aaBnWdjOMrMcqNr2dogmmVw';

const isConfigured = supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

if (!isConfigured) {
    console.warn("Supabase credentials are not configured. Authentication will not work. Please add your project URL and Anon Key in 'services/supabaseClient.ts'");
}

// Export the client only if it's configured, otherwise export null.
// This prevents the createClient call with invalid credentials from crashing the app.
export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;