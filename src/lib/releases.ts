// Update this entry and its unique version whenever a user-facing feature ships.
export const latestRelease = {
 version:'1.5.0', date:'1 November 2026',title:'Struk lebih lengkap, rencana lebih jelas',
 changes:['Pembayaran, pengeluaran, dan dokumen mendukung hingga 3 lampiran.','Catatan dan struk bisa diubah saat mencatat pembayaran atau lewat Edit.','Rencana belum dibayar ditandai merah muda dan tulisan Belum dibayar.'],
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
