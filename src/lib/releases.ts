// Update this entry and its unique version whenever a user-facing feature ships.
export const latestRelease = {
 version:'1.5.1', date:'1 November 2026',title:'Realisasi dan rencana kini lebih jelas',
 changes:['Realisasi Pengeluaran menunjukkan uang yang sudah dibayar.','Proyeksi Pengeluaran mencakup pembayaran dan rencana biaya.'],
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
