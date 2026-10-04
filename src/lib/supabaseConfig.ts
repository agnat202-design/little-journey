export interface SupabaseEnvironment {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export type SupabaseConfiguration =
  | { status: 'unconfigured' }
  | { status: 'invalid'; message: string }
  | { status: 'configured'; url: string; publishableKey: string };

// Never include credentials or user-supplied values in configuration errors.
export function readSupabaseConfiguration(env: SupabaseEnvironment): SupabaseConfiguration {
  const url = env.VITE_SUPABASE_URL?.trim() || '';
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || '';
  if (!url && !publishableKey) return { status: 'unconfigured' };
  if (!url || !publishableKey) {
    return { status: 'invalid', message: 'Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.' };
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password ||
      parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error();
  } catch {
    return { status: 'invalid', message: 'VITE_SUPABASE_URL must be an HTTPS project origin.' };
  }
  // This project uses the current publishable-key format. Reject secret/admin/JWT
  // keys rather than accidentally allowing privileged credentials into a bundle.
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) {
    return { status: 'invalid', message: 'Use a Supabase publishable key, never a secret or service-role key.' };
  }
  return { status: 'configured', url: url.replace(/\/$/, ''), publishableKey };
}
