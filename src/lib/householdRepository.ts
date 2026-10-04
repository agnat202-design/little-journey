import type { SupabaseClient } from '@supabase/supabase-js';
import type { LocalAttachment } from '../types/domain';
import { decodeHousehold, householdChanges, type HouseholdSnapshot } from './householdRecords';

export class HouseholdRepository {
  constructor(private client:SupabaseClient, public current:HouseholdSnapshot) {}
  static async load(client:SupabaseClient, id:string) {
    const { data,error } = await client.rpc('load_household',{p_household_id:id});
    if (error || !data) throw error || new Error('Unable to load household');
    return new HouseholdRepository(client,decodeHousehold(data));
  }
  async save(input:HouseholdSnapshot):Promise<HouseholdSnapshot> {
    const uploaded:string[] = [];
    const upload = async(a:LocalAttachment | undefined) => {
      if (!a || a.storagePath) return a;
      if (!a.file) throw new Error('Pilih ulang file yang akan diunggah.');
      if (a.size>10485760) throw new Error('Ukuran file maksimal 10 MB.');
      const path = `${this.current.householdId}/${crypto.randomUUID()}`;
      const {error} = await this.client.storage.from('family-files').upload(path,a.file,{contentType:a.mimeType || 'application/octet-stream',upsert:false});
      if(error) throw error;
      uploaded.push(path);
      return {...a, storagePath:path, file:undefined};
    };
    try {
      const next:HouseholdSnapshot = {...input, allocations:input.allocations.map(a => ({...a,id:a.id || this.current.allocations.find(old => old.category===a.category)?.id || (a.planned>0?crypto.randomUUID():undefined)})),
        records:{...input.records, expenses:[],documents:[]} };
      for(const e of input.records.expenses) next.records.expenses.push({...e,attachment:await upload(e.attachment)});
      for(const d of input.records.documents) next.records.documents.push({...d,attachment:(await upload(d.attachment))!});
      const {data,error} = await this.client.rpc('save_household_changes',{
        p_household_id:this.current.householdId,p_version:this.current.version,p_changes:householdChanges(this.current,next),
        p_budget:input.totalBudget!==this.current.totalBudget || input.budgetConfigured!==this.current.budgetConfigured
          ? {total_budget:input.budgetConfigured?input.totalBudget:null} : null,
      });
      if(error || !data) throw error || new Error('Unable to save household');
      const filePaths=(snapshot:HouseholdSnapshot)=>[...snapshot.records.expenses.map(r=>r.attachment?.storagePath),...snapshot.records.documents.map(r=>r.attachment.storagePath)].filter((p):p is string=>!!p);
      const retained=new Set(filePaths(next));
      const obsolete=filePaths(this.current).filter(p=>!retained.has(p));
      this.current = decodeHousehold(data);
      // Metadata is committed first; never remove a file still referenced by a record.
      if(obsolete.length) {
        const result=await this.client.storage.from('family-files').remove([...new Set(obsolete)]).catch(()=>({error:true}));
        if(result.error)this.current.fileCleanupPending=true;
      }
      return this.current;
    } catch(error) {
      // Upload precedes metadata commit. Remove uncommitted files on failure.
      if(uploaded.length) await this.client.storage.from('family-files').remove(uploaded).catch(()=>{});
      throw error;
    }
  }
}

export function persistenceError(error:any) {
  if(error?.code==='40001') return 'Ada perubahan dari halaman lain. Muat ulang data sebelum menyimpan lagi.';
  if(error?.code==='PGRST202') return 'Layanan penyimpanan belum tersedia. Silakan coba lagi setelah layanan aktif.';
  if(error?.status===413 || error?.statusCode==='413') return 'Ukuran file maksimal 10 MB.';
  return 'Belum dapat memastikan penyimpanan. Periksa koneksi dan muat ulang data.';
}
