import { useEffect,useState, type ReactNode } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { HouseholdRepository,persistenceError } from '../lib/householdRepository';
import type { HouseholdSnapshot } from '../lib/householdRecords';
import { fieldClass,labelClass } from './records/RecordEditor';

export interface HouseholdRuntime { initial:HouseholdSnapshot; save:(next:HouseholdSnapshot)=>Promise<HouseholdSnapshot>; }
export default function HouseholdGate({client,user,children}:{client:SupabaseClient;user:User;children:(runtime:HouseholdRuntime)=>ReactNode}) {
  const [repository,setRepository] = useState<HouseholdRepository | null>(null);
  const [choices,setChoices] = useState<Array<{id:string;name:string}>>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [name,setName] = useState('');
  const [displayName,setDisplayName] = useState(String(user.user_metadata?.full_name || user.user_metadata?.name || ''));
  const [dueDate,setDueDate] = useState('');
  async function open(id:string) {
    setLoading(true);setError('');
    try {setRepository(await HouseholdRepository.load(client,id));}
    catch(e){setError(persistenceError(e));}
    finally{setLoading(false);}
  }
  async function discover() {
    setLoading(true);setError('');
    try {
      const {data,error:failure} = await client.from('household_members').select('household_id,households(id,name)').eq('user_id',user.id).eq('status','active');
      if(failure) throw failure;
      const households = (data || []).map((r:any)=>r.households).filter(Boolean);
      setChoices(households);
      if(households.length===1) await open(households[0].id);
    }catch(e){setError(persistenceError(e));}
    finally{setLoading(false);}
  }
  useEffect(()=>{void discover();},[client,user.id]);
  if(repository) return <>{children({initial:repository.current,save:next=>repository.save(next)})}</>;
  return <main className="min-h-[85svh] bg-[#FCFBF8] flex items-center justify-center p-5"><section className="w-full max-w-md rounded-[28px] bg-white border border-[#F0ECE4] p-7 shadow-sm">
    <img src="/little-journey-mark.svg" alt="" width="48" height="48" className="mb-5" />
    <h1 className="text-2xl font-black text-[#34236B]">{choices.length?'Pilih keluarga':'Siapkan ruang keluarga'}</h1>
    {loading?<p className="mt-4" role="status">Memuat data…</p>:error?<div className="mt-4"><p role="alert" className="text-sm text-[#79738E]">{error}</p><button className="mt-4 underline font-bold" onClick={discover}>Coba lagi</button></div>:choices.length?<div className="mt-4 space-y-3">{choices.map(h=><button key={h.id} className={fieldClass} onClick={()=>open(h.id)}>{h.name}</button>)}</div>:<form className="mt-5 space-y-4" onSubmit={async e=>{
      e.preventDefault();if(!name.trim() || !displayName.trim())return;setLoading(true);setError('');
      try {const {data,error:failure}=await client.rpc('setup_household',{p_name:name.trim(),p_display_name:displayName.trim(),p_due_date:dueDate || null});if(failure)throw failure;await open(data);}
      catch(e){setError(persistenceError(e));setLoading(false);}
    }}>
      <p className="text-sm text-[#79738E]">Catatan dan pengeluaran akan disimpan di ruang keluarga ini.</p>
      <div><label className={labelClass} htmlFor="profile-name">Nama Anda *</label><input id="profile-name" required value={displayName} onChange={e=>setDisplayName(e.target.value)} className={fieldClass}/></div>
      <div><label className={labelClass} htmlFor="household-name">Nama keluarga / ruang keluarga *</label><input id="household-name" required placeholder="Nama ruang keluarga" value={name} onChange={e=>setName(e.target.value)} className={fieldClass}/></div>
      <div><label className={labelClass} htmlFor="pregnancy-due-date">HPL (opsional)</label><input id="pregnancy-due-date" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className={fieldClass}/><p className="mt-2 text-xs text-[#79738E]">Isi jika sedang menyiapkan kehamilan. Minggu kehamilan dihitung dari tanggal ini.</p></div>
      <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#34236B] to-[#6C4CF5] text-white font-black">Mulai</button>
    </form>}
  </section></main>;
}
