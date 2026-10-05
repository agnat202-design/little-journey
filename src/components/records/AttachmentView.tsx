import { attachmentLabel } from '../../lib/uploadImage';
import React, {useEffect,useState} from 'react';
import { LocalAttachment } from '../../types/domain';
import {getSupabaseClient} from '../../lib/supabase';
export function AttachmentView({ attachment, onClose }: { attachment: LocalAttachment; onClose: () => void }) {
  const [url,setUrl] = useState(attachment.storagePath?undefined:attachment.localUrl);
  const [error,setError] = useState('');
  useEffect(()=>{
    let active=true;
    if(!attachment.storagePath)return;
    const client=getSupabaseClient();
    if(!client){setError('Lampiran belum dapat dibuka.');return;}
    void client.storage.from('family-files').createSignedUrl(attachment.storagePath,300).then(({data,error:failure})=>{
      if(!active)return;if(failure || !data)setError('Lampiran belum dapat dibuka. Periksa koneksi dan coba lagi.');else setUrl(data.signedUrl);
    }).catch(()=>{if(active)setError('Lampiran belum dapat dibuka. Periksa koneksi dan coba lagi.');});
    return ()=>{active=false;};
  },[attachment.storagePath]);
  return <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"><div className="absolute inset-0" onClick={onClose} /><div role="dialog" aria-modal="true" aria-labelledby="attachment-title" className="relative bg-white w-full max-w-3xl rounded-[28px] p-5 max-h-[92vh] overflow-y-auto"><div className="flex items-start justify-between gap-3 mb-3"><h2 id="attachment-title" className="font-black text-[#292442]">{attachmentLabel(attachment)}</h2><button aria-label="Tutup Lampiran" onClick={onClose} className="p-2 bg-[#F5F3ED] rounded-full">✕</button></div>{url ? <>{attachment.mimeType.startsWith('image/') ? <img src={url} alt={attachment.name} className="max-h-[65vh] mx-auto object-contain" /> : attachment.mimeType === 'application/pdf' ? <iframe title={attachment.name} src={url} className="w-full h-[65vh] rounded-xl" /> : <p className="text-sm text-[#79738E]">Buka atau unduh file untuk melihat isinya.</p>}<a href={url} target="_blank" rel="noopener noreferrer" download={attachment.name} className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#EEE9FF] text-[#6C4CF5] font-bold text-xs">Buka / Unduh File</a></> : <p className="text-sm">{error || (attachment.storagePath ? 'Memuat lampiran…' : 'File belum tersedia.')}</p>}</div></div>;
}
