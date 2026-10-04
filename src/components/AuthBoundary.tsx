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

  return <main className="min-h-svh bg-[#FCFBF8] text-[#292442] lg:grid lg:grid-cols-2">
    <section className="relative overflow-hidden bg-[#292442] px-7 pt-8 pb-20 text-[#FCFBF8] lg:flex lg:min-h-svh lg:flex-col lg:justify-between lg:p-14">
      <div className="relative z-10 flex items-center gap-3">
        <img src="/little-journey-mark.svg" alt="" width="44" height="44" className="rounded-2xl border border-white/15" />
        <span className="text-xl font-extrabold tracking-tight">Little Journey<span className="ml-1 text-[#BCE4D0]">.</span></span>
      </div>
      <div className="relative z-10 mx-auto mt-9 max-w-md lg:my-16 lg:mx-0">
        <svg viewBox="0 0 320 220" aria-hidden="true" className="mx-auto mb-5 h-36 w-auto lg:mx-0 lg:mb-9 lg:h-60">
          <path d="M65 199V105a95 95 0 0 1 190 0v94" fill="#39334F"/>
          <path d="M105 199v-85a55 55 0 0 1 110 0v85" fill="#4B4262"/>
          <path d="M160 180v-71" stroke="#FCFBF8" stroke-width="7" stroke-linecap="round"/>
          <path d="M159 138C111 142 96 112 105 84C142 81 167 107 159 138Z" fill="#BCE4D0"/>
          <path d="M161 113C158 78 186 61 217 69C222 103 193 124 161 113Z" fill="#F0B6A3"/>
          <path d="M135 181c14-8 36-8 51 0" stroke="#FCFBF8" stroke-width="5" stroke-linecap="round"/>
          <circle cx="57" cy="82" r="6" fill="#D7CDF3"/>
          <circle cx="264" cy="153" r="5" fill="#F0B6A3"/>
          <path d="m252 42 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#BCE4D0"/>
        </svg>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#BCE4D0]">Tumbuh bersama</p>
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight lg:text-5xl">Perjalanan kecil.<br />Cinta yang besar.</h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#D7D0E3] lg:text-base">Satu tempat untuk merencanakan dan mencatat perjalanan keluarga.</p>
      </div>
      <p className="hidden text-xs text-[#D7D0E3] lg:block">Little Journey · Setiap langkah berarti.</p>
      <div aria-hidden="true" className="absolute -right-28 -bottom-36 h-80 w-80 rounded-full border border-white/10" />
    </section>
    <section className="relative -mt-8 rounded-t-[32px] bg-[#FCFBF8] px-7 py-9 lg:m-0 lg:flex lg:items-center lg:justify-center lg:rounded-none lg:p-14">
      <div className="mx-auto w-full max-w-sm">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#85758E]">Selamat datang</p>
      <h2 className="text-3xl font-extrabold tracking-tight">Mulai perjalananmu</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#777185]">Masuk atau buat akun dengan Google.<br />Satu tombol untuk keduanya.</p>
      {loading ? <p className="mt-8" role="status">Memeriksa login…</p> : <button
        onClick={login} disabled={!client || busy}
        className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#DED9E5] bg-white px-5 py-3 font-bold shadow-sm transition hover:border-[#85758E] hover:bg-[#F7F4FA] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85758E] disabled:opacity-50"
      ><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.49H3.07A10 10 0 0 0 2 12c0 1.61.38 3.14 1.07 4.51l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51L18.7 4.6A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>{busy ? 'Menghubungkan…' : 'Lanjut dengan Google'}</button>}
      <p className="mt-4 text-center text-xs text-[#85758E]">Gunakan akun Google pilihanmu.</p>
      {!client && !loading && <p className="mt-4 text-sm" role="alert">Login belum dikonfigurasi untuk aplikasi ini.</p>}
      {error && <p className="mt-4 text-sm" role="alert">{error}</p>}
      <div className="mt-8 rounded-2xl bg-[#EEEAF3] px-4 py-3 text-xs leading-relaxed text-[#655B75]">
        <span className="font-bold">Versi pengembangan</span><br />Data keluarga belum tersimpan ke akun pada tahap ini.
      </div>
      </div>
    </section>
  </main>;
}
