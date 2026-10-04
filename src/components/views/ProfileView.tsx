import React, { useEffect, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { fieldClass, labelClass, buttonClass } from '../records/RecordEditor';

export function ProfileView({ client, user, householdId }: { client: SupabaseClient; user: User; householdId: string }) {
  const [family, setFamily] = useState('');
  const [children, setChildren] = useState<Array<{id:string;display_name:string}>>([]);
  const [childName, setChildName] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function load() {
    setLoading(true); setError('');
    try {
      const [h,c] = await Promise.all([client.from('households').select('name').eq('id',householdId).single(),client.from('children').select('id,display_name').eq('household_id',householdId).order('created_at')]);
      if(h.error || c.error) throw h.error || c.error;
      setFamily(h.data.name);setChildren(c.data || []);
    } catch { setError('Profil belum dapat dimuat. Coba lagi.'); }
    finally {setLoading(false);}
  }
  useEffect(()=>{void load();},[client,householdId]);
  async function saveChild() {
    if(busy || !childName.trim())return;setBusy(true);setError('');setMessage('');
    const query = editing ? client.from('children').update({display_name:childName.trim()}).eq('household_id',householdId).eq('id',editing) : client.from('children').insert({household_id:householdId,display_name:childName.trim()});
    try { const result=await query.select('id').single();if(result.error)throw result.error;await load();setEditing(null);setChildName('');setMessage('Nama anak tersimpan.'); }
    catch {setError('Nama anak belum berhasil disimpan. Muat ulang sebelum mencoba lagi.');}
    finally {setBusy(false);}
  }
  return <div className="mx-auto max-w-2xl space-y-5 px-4 pb-28">
    <h1 className="text-2xl font-black">Profil</h1>
    <section className="rounded-[24px] border border-[#F0ECE4] bg-white p-5"><h2 className="font-black">Akun Google</h2><p className="mt-2 text-sm break-all">{user.email || 'Email tidak tersedia'}</p></section>
    {error && <p role="alert" className="text-sm text-[#B14435]">{error}<button onClick={()=>window.location.reload()} className="ml-2 underline">Muat ulang</button></p>}
    {message && <p role="status" className="text-sm text-[#1EA896]">{message}</p>}
    {loading ? <p role="status">Memuat profil…</p> : !error && <>
      <form className="rounded-[24px] border border-[#F0ECE4] bg-white p-5 space-y-3" onSubmit={async e=>{e.preventDefault();if(busy || !family.trim())return;setBusy(true);setError('');try {const result=await client.from('households').update({name:family.trim()}).eq('id',householdId).select('id').single();if(result.error)throw result.error;window.location.reload();}catch{setError('Nama keluarga belum berhasil disimpan. Muat ulang sebelum mencoba lagi.');setBusy(false);}}}>
        <label htmlFor="family-profile-name" className={labelClass}>Nama keluarga</label><input id="family-profile-name" required value={family} onChange={e=>setFamily(e.target.value)} className={fieldClass}/><button disabled={busy} className={buttonClass}>Simpan Nama Keluarga</button>
      </form>
      <section className="rounded-[24px] border border-[#F0ECE4] bg-white p-5 space-y-3"><h2 className="font-black">Anak</h2>
        {!children.length && <p className="text-sm text-[#79738E]">Belum ada nama anak.</p>}
        {children.map(child=><div key={child.id} className="flex items-center justify-between gap-3 border-b border-[#F0ECE4] py-2"><span className="break-all">{child.display_name}</span><button disabled={busy} onClick={()=>{setEditing(child.id);setChildName(child.display_name);setMessage('');}} className="font-bold text-[#6C4CF5]">Edit</button></div>)}
        <form className="space-y-3" onSubmit={e=>{e.preventDefault();void saveChild();}}><label htmlFor="child-profile-name" className={labelClass}>{editing ? 'Edit nama anak' : 'Tambah nama anak'}</label><input id="child-profile-name" required value={childName} onChange={e=>setChildName(e.target.value)} className={fieldClass}/><div className="flex gap-3"><button disabled={busy} className={buttonClass}>{busy?'Menyimpan…':'Simpan Nama Anak'}</button>{editing && <button type="button" disabled={busy} onClick={()=>{setEditing(null);setChildName('');}}>Batal</button>}</div></form>
      </section>
    </>}
  </div>;
}
