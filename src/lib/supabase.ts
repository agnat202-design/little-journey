import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readSupabaseConfiguration } from './supabaseConfig';

let client: SupabaseClient | undefined;

// Lazy singleton: merely loading the frontend does not query or write user records.
// Auth/onboarding and module persistence are separate implementation phases.
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  const configuration = readSupabaseConfiguration({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  });
  if (configuration.status === 'unconfigured') return null;
  if (configuration.status === 'invalid') throw new Error(configuration.message);
  client = createClient(configuration.url, configuration.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
  return client;
}
