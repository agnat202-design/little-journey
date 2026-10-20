// Update this entry and its unique version whenever a user-facing feature ships.
export const latestRelease = {
 version:'1.1.0', date:'20 Oktober 2026',
 title:'Sekarang lebih mudah mencari catatan',
 changes:[
  'Cari dokumen, pengeluaran, jadwal, checklist, dan belanja dari satu kolom.',
  'Ketik “lab” atau “laboratorium”, lalu buka hasil dan lampirannya.',
  'Lihat kabar pembaruan aplikasi kapan saja di Profil.',
 ],
};
export const releaseNoticeKey=(version:string)=>'little-journey:update-views:'+version;
export function claimReleaseNotice(storage:Pick<Storage,'getItem'|'setItem'>,version:string):boolean {
 try {
  const raw=Number(storage.getItem(releaseNoticeKey(version))||0);
  const count=Number.isFinite(raw)&&raw>=0?Math.floor(raw):0;
  if(count>=3)return false;
  storage.setItem(releaseNoticeKey(version),String(count+1));return true;
 }catch{return false;}
}
