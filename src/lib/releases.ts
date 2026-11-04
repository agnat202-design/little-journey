// Update this entry and its unique version whenever a user-facing feature ships.
export const latestRelease = {
 version:'2.0.0',date:'4 November 2026',title:'Beranda baru, catatan lebih mudah ditemukan',
 changes:['Beranda lebih ringkas: jadwal terdekat, persiapan, dan keuangan.','Dokumen bisa dicari, disaring menurut jenis, dan diurutkan.','Checklist bisa difilter menjadi belum selesai atau selesai.'],
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
