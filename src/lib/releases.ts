// Update this entry and its unique version whenever a user-facing feature ships.
export const latestRelease = {
 version:'1.6.0', date:'1 November 2026',title:'Tampilan HP lebih ringkas dan nyaman',
 changes:['Profil ada di atas. HPL dan laporan tersedia di menu Lainnya.','Tombol lebih mudah disentuh dan tulisan form lebih nyaman dibaca.','Lampiran tambahan bisa dibuka saat diperlukan.'],
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
