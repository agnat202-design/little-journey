import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { readSupabaseConfiguration } from './supabaseConfig';

const url = 'https://example-project.supabase.co';
const key = 'sb_publishable_test_fixture';
assert.equal(readSupabaseConfiguration({}).status, 'unconfigured');
assert.equal(readSupabaseConfiguration({ VITE_SUPABASE_URL: ' ', VITE_SUPABASE_PUBLISHABLE_KEY: '' }).status, 'unconfigured');
assert.equal(readSupabaseConfiguration({ VITE_SUPABASE_URL: url }).status, 'invalid');
assert.equal(readSupabaseConfiguration({ VITE_SUPABASE_PUBLISHABLE_KEY: key }).status, 'invalid');
for (const unsafe of ['http://example.com', 'not-url', `${url}/rest/v1`, 'https://user:password@example.com', `${url}?token=x`]) {
  assert.equal(readSupabaseConfiguration({ VITE_SUPABASE_URL: unsafe, VITE_SUPABASE_PUBLISHABLE_KEY: key }).status, 'invalid');
}
for (const unsafe of ['sb_secret_do_not_use', 'service_role', 'eyJ.fake.jwt']) {
  const result = readSupabaseConfiguration({ VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: unsafe });
  assert.equal(result.status, 'invalid');
  assert.ok(!JSON.stringify(result).includes(unsafe));
}
const config = readSupabaseConfiguration({ VITE_SUPABASE_URL: ` ${url}/ `, VITE_SUPABASE_PUBLISHABLE_KEY: ` ${key} ` });
assert.equal(config.status, 'configured');
if (config.status !== 'configured') throw new Error('Configuration failed');
assert.equal(config.url, url);
let requests = 0;
const client = createClient(config.url, config.publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: async (input, init) => {
    requests++;
    assert.equal(new Headers(init?.headers).get('apikey'), key);
    assert.ok(String(input).startsWith(`${url}/rest/v1/profiles`));
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
  } },
});
assert.equal(requests, 0, 'Creating the client must not write/query records');
const { data, error } = await client.from('profiles').select('id').limit(1);
assert.equal(error, null);
assert.deepEqual(data, []);
assert.equal(requests, 1);
console.log('PASS Supabase configuration: missing/invalid/public-only keys, URL safety and SDK request wiring');
