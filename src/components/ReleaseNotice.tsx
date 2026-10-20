import React,{useEffect,useRef,useState} from 'react';
import {claimReleaseNotice,latestRelease} from '../lib/releases';
export function ReleaseNotice(){
 const [visible,setVisible]=useState(false);const checked=useRef(false);
 useEffect(()=>{if(checked.current)return;checked.current=true;try{setVisible(claimReleaseNotice(window.localStorage,latestRelease.version));}catch{/* No notice if this browser blocks storage. */}},[]);
 if(!visible)return null;
 return <aside aria-label="Pembaruan aplikasi" className="mx-4 lg:mx-8 mt-3 rounded-2xl border border-[#DDD3FF] bg-[#F3EFFF] p-4 text-[#34236B]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#6C4CF5]">Ada yang baru • {latestRelease.date}</p><h2 className="mt-1 text-sm font-black">{latestRelease.title}</h2><p className="mt-1 text-xs">Gunakan kolom “Cari semua catatan” untuk menemukan data. Rincian pembaruan ada di Profil.</p></div><button type="button" aria-label="Tutup pemberitahuan pembaruan" onClick={()=>setVisible(false)} className="shrink-0 rounded-full px-2 py-1 font-bold">✕</button></div></aside>;
}
export function ReleaseHistory(){return <section className="rounded-[24px] border border-[#F0ECE4] bg-white p-5 space-y-2"><h2 className="font-black">Pembaruan terbaru</h2><p className="text-xs text-[#79738E]">Versi {latestRelease.version} • {latestRelease.date}</p><ul className="list-disc pl-5 space-y-2 text-sm">{latestRelease.changes.map(change=><li key={change}>{change}</li>)}</ul></section>;}
