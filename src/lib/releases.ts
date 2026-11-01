// Update this entry and its unique version whenever a user-facing feature ships.
export const latestRelease = {
 version:'1.3.0', date:'1 November 2026',
 title:'Menu lebih mudah dipahami',
 changes:[
  'Nama menu lebih jelas: Beranda, Belanja, Keuangan, Jadwal Kontrol, dan Dokumen.',
  'Kategori memakai bahasa Indonesia, seperti Kesehatan dan Perlengkapan anak.',
  'Tombol Tambah Barang ada di atas daftar. Checklist dilengkapi petunjuk singkat.',
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
