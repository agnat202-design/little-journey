// Update this entry and its unique version whenever a user-facing feature ships.
export const latestRelease = {
 version:'1.7.0',date:'2 November 2026',title:'Kebutuhan mendatang lebih mudah dibaca',
 changes:['Biaya belum dibayar dan barang belum dibeli dipisahkan, lengkap dengan subtotal.','Biaya memakai merah muda; barang memakai ungu muda.','Tanda merah lebih tegas hanya saat melewati tanggal rencana.'],
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
