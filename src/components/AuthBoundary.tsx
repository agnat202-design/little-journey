import { useEffect, useState, type ReactNode } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';
import { readSupabaseConfiguration } from '../lib/supabaseConfig';

export default function AuthBoundary({ children }: { children: ReactNode }) {
  const [client] = useState<SupabaseClient | null>(() => {
    try { return getSupabaseClient(); } catch { return null; }
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    return query.has('error') || hash.has('error')
      ? 'Login dibatalkan atau belum berhasil. Silakan coba lagi.' : '';
  });

  useEffect(() => {
    if (!client) { setLoading(false); return; }
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      if (active) { setSession(next); setLoading(false); }
    });
    client.auth.getSession().then(({ data, error: failure }) => {
      if (!active) return;
      setSession(data.session);
      if (failure) setError('Login belum berhasil. Silakan coba lagi.');
      setLoading(false);
    }).catch(() => {
      if (active) { setError('Tidak dapat memeriksa login. Muat ulang halaman untuk mencoba lagi.'); setLoading(false); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [client]);

  async function login() {
    if (!client || busy) return;
    setBusy(true); setError('');
    try {
      const configuration = readSupabaseConfiguration({
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      });
      if (configuration.status !== 'configured') throw new Error('Missing configuration');
      const response = await fetch(configuration.url + '/auth/v1/settings', {
        headers: { apikey: configuration.publishableKey }, signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Unable to check provider');
      const settings = await response.json();
      if (settings.external?.google !== true) {
        setError('Login Google belum diaktifkan. Aktifkan provider Google di Supabase terlebih dahulu.');
        setBusy(false);
        return;
      }
      const { error: failure } = await client.auth.signInWithOAuth({
        provider: 'google', options: { redirectTo: window.location.origin + '/' },
      });
      if (failure) throw failure;
    } catch {
      setError('Login Google belum berhasil. Periksa koneksi atau pengaturan Google di Supabase.');
      setBusy(false);
    }
  }

  async function logout() {
    if (!client || busy) return;
    setBusy(true); setError('');
    try {
      const { error: failure } = await client.auth.signOut({ scope: 'local' });
      if (failure) throw failure;
      setSession(null);
    } catch { setError('Belum berhasil keluar. Silakan coba lagi.'); }
    finally { setBusy(false); }
  }

  // Remount the prototype for each account: ephemeral family records cannot leak between logins.
  if (session) return <div key={session.user.id}>
    <div className="bg-[#E8F5EF] px-4 py-2 text-center text-sm text-[#292442]">
      Login berhasil. Data keluarga masih prototipe dan belum tersimpan ke akun.
      <button onClick={logout} disabled={busy} className="ml-3 underline font-bold disabled:opacity-50">{busy ? 'Memproses…' : 'Keluar'}</button>
      {error && <p role="alert">{error}</p>}
    </div>
    {children}
  </div>;

  return <main className="min-h-screen bg-[#FCFBF8] flex items-center justify-center p-6 text-[#292442]">
    <section className="w-full max-w-md rounded-3xl bg-white border border-[#EEEAF2] p-8 text-center shadow-sm">
      <h1 className="text-3xl font-bold">Little Journey</h1>
      <p className="mt-3 text-sm text-[#777185]">Masuk atau daftar dengan akun Google.</p>
      <p className="mt-3 text-sm text-[#777185]">Data keluarga belum tersimpan ke akun pada tahap ini.</p>
      {loading ? <p className="mt-6" role="status">Memeriksa login…</p> : <button
        onClick={login} disabled={!client || busy}
        className="mt-6 w-full rounded-full bg-[#292442] text-white px-5 py-3 font-bold disabled:opacity-50"
      >{busy ? 'Menghubungkan…' : 'Lanjut dengan Google'}</button>}
      {!client && !loading && <p className="mt-4 text-sm" role="alert">Login belum dikonfigurasi untuk aplikasi ini.</p>}
      {error && <p className="mt-4 text-sm" role="alert">{error}</p>}
    </section>
  </main>;
}
