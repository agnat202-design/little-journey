// Update this entry and its unique version whenever a user-facing feature ships.
export const latestRelease = {
 version:'1.2.0', date:'1 November 2026',
 title:'Tambah catatan sekarang lebih langsung',
 changes:[
  'Tambah Barang langsung membuka form barang.',
  'Tambah Checklist langsung membuka form checklist tanpa pilihan lain.',
  'Dokumen sekarang bisa ditambahkan dari Catat Cepat.',
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
