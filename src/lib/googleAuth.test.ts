import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const values = new Map<string, string>();
let requests = 0;
const client = createClient('https://fixture.supabase.co', 'sb_publishable_fixture', {
  auth: {
    persistSession: true, autoRefreshToken: false, detectSessionInUrl: false, flowType: 'pkce',
    storage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); },
      removeItem: key => { values.delete(key); },
    },
  },
  global: { fetch: async () => { requests++; throw new Error('Unexpected data request'); } },
});
assert.equal((await client.auth.getSession()).data.session, null);
const { data, error } = await client.auth.signInWithOAuth({
  provider: 'google', options: { redirectTo: 'https://little-journey.example/', skipBrowserRedirect: true },
});
assert.equal(error, null);
assert.equal(data.provider, 'google');
const url = new URL(data.url!);
assert.equal(url.origin, 'https://fixture.supabase.co');
assert.equal(url.pathname, '/auth/v1/authorize');
assert.equal(url.searchParams.get('provider'), 'google');
assert.equal(url.searchParams.get('redirect_to'), 'https://little-journey.example/');
assert.equal(url.searchParams.get('code_challenge_method'), 's256');
assert.ok(url.searchParams.get('code_challenge'));
assert.ok([...values.keys()].some(key => key.endsWith('-code-verifier')));
assert.equal((await client.auth.signOut({ scope: 'local' })).error, null);
assert.equal((await client.auth.getSession()).data.session, null);
assert.equal(requests, 0, 'Starting OAuth must not read or write family data');
console.log('PASS Google Auth: Google provider, callback destination, PKCE, signed-out session, local logout, no family data requests');
