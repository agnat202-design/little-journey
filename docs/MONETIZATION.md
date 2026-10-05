# Little Journey — Rencana Monetisasi
Diperbarui: 5 Oktober 2026. Ini rencana, bukan fitur pembayaran yang sudah tersedia.

## Keputusan biaya backend
Tetap memakai Supabase Free untuk MVP dan pelanggan awal selama pemakaian masih sesuai kuota. Mendapat pelanggan berbayar tidak otomatis mewajibkan Pro. Tidak ada upgrade, pembelian layanan, atau tagihan baru yang diotorisasi. Biaya tetap dijaga rendah sampai ada kebutuhan dan pendapatan yang mendukung.

Supabase tetap menjadi backend; tidak perlu pindah hanya untuk monetisasi. Pro mulai US$25/bulan adalah opsi operasional, bukan biaya wajib sejak peluncuran. Free tidak menyediakan backup otomatis yang dapat diandalkan melalui dashboard, dan proyek dapat dijeda bila aktivitas rendah. Jumlah pelanggan saja tidak menentukan kapasitas: foto, unduhan, dan aktivitas tiap keluarga juga berpengaruh.

Kuota acuan Free saat ditinjau: database 500 MB, file Storage 1 GB, egress 5 GB dan cached egress 5 GB (kuota terpisah). Cek dashboard dan harga terbaru sebelum keputusan kapasitas; angka pengguna aktif bukan jaminan kemampuan menampung semua lampiran.

## Cara tetap Free dengan perlindungan data
Pekerjaan berikut harus diimplementasikan dan diverifikasi; belum tersedia sebagai backup lengkap saat ini:
1. Backup operator ke tempat terpisah: salinan database/schema yang dapat dipulihkan, beserta file asli di Storage. Gunakan akses server/operator yang terlindungi; jangan menaruh service-role key di frontend atau repo.
2. Buat jadwal salinan harian, retensi awal 7 harian dan 4 mingguan, serta pemeriksaan hasil/jumlah file. Jika kapasitas tempat backup gratis tidak cukup, evaluasi biaya sebelum menjanjikan kapasitas lebih besar. Backup terpisah tidak otomatis gratis atau tanpa batas.
3. Uji pemulihan ke lingkungan terpisah: database, relasi, akses antar keluarga, dan foto dapat dibuka. Catat waktu dan hasil. Backup harian berarti perubahan sejak backup terakhir masih bisa hilang; jangan menjanjikan nol kehilangan data.
4. Pantau pemakaian database, Storage dan egress tiap minggu serta error simpan/upload. Tinjau kapasitas saat mendekati 70% kuota; angka ini ambang internal, bukan aturan Supabase.
5. Tentukan kuota file per keluarga yang benar-benar ditegakkan di server, beri pemberitahuan sebelum batas, dan jangan menghapus data pengguna hanya karena paket berakhir. Foto baru sudah diperkecil sebelum upload, tetapi total kapasitas tetap terbatas.
6. Download PDF/JSON pengguna tetap tersedia sebagai salinan tambahan. JSON sekarang tidak membawa foto asli dan belum memiliki fitur impor, sehingga bukan pengganti backup operator.

Upgrade dipertimbangkan saat kuota hampir habis, kebutuhan layanan tidak boleh dijeda, atau kebutuhan backup/operasional tidak lagi layak dikelola manual. Nilai kebutuhan dan pendapatan bersama; tidak wajib upgrade hanya karena ada satu pelanggan. Backup database Pro pun tidak mencakup binary foto Storage: salinan file tetap diperlukan.

## Tahap menuju penjualan
1. Stabilkan web: QA produksi login/CRUD/foto/lintas perangkat, backup-pemulihan, privasi dan hapus akun.
2. Uji dengan sekitar 20 keluarga: pemakaian rutin, masalah utama, dan kesediaan membayar. Jangan menganggap angka harga berikut sudah terbukti.
3. Monetisasi web: pembayaran, paket/masa aktif di server, batas penyimpanan, pembayaran gagal/refund dan status paket berakhir. Data tetap dapat diakses/diekspor sesuai kebijakan yang disepakati.
4. Android: packaging/signing, login mobile, kamera/download, Play Billing/verifikasi server/restore pembelian, kebijakan dan closed testing sesuai jenis akun. Akun personal baru yang terkena aturan membutuhkan 12 tester opted-in 14 hari terus-menerus sebelum mengajukan produksi.
5. App Store setelah Android/penjualan terbukti: QA iOS, login yang memenuhi aturan Apple, billing, hapus akun dan review. Membership US$99/tahun; wrapper web saja tidak menjamin approval.
6. English dan pasar internasional setelah alur Indonesia stabil; mata uang dan format tanggal membutuhkan implementasi tersendiri.

## Harga usulan untuk diuji
- Trial 14 hari.
- Rp14.900/bulan atau Rp99.000/tahun.
- Promo awal Rp79.000 untuk tahun pertama, tanpa janji akses seumur hidup.
- Rp5.000 terlalu tipis sebagai harga normal menurut hipotesis biaya saat ini; Rp500.000 belum didukung nilai produk/validasi pasar saat ini.
Harga belum menjadi keputusan peluncuran. Contoh 100 pelanggan bulanan menghasilkan Rp1.490.000 bruto; potongan langganan Play 15% menyisakan Rp1.266.500 sebelum pajak, backend, pemasaran dan dukungan. Jangan menyebutnya laba bersih.

## Shopee
Jalur tambahan bersyarat, bukan rencana kanal utama. Konfirmasi izin/kategori untuk akses atau voucher langganan aplikasi sebelum listing; keberadaan produk digital tidak berarti setiap seller boleh menjual setiap layanan. Jika diizinkan, uji akses 12 bulan dengan aktivasi, masa berlaku dan refund yang jelas. Jangan menjadikan tombol beli Shopee di aplikasi store sebagai cara menghindari billing; aturan platform dan negara berlaku.

## Referensi (ditinjau 5 Oktober 2026)
- [Supabase pricing](https://supabase.com/pricing)
- [Free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Database backups dan batas Storage](https://supabase.com/docs/guides/platform/backups)
- [Google testing](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google pembayaran](https://support.google.com/googleplay/android-developer/answer/9858738)
- [Google biaya langganan](https://support.google.com/googleplay/android-developer/answer/112622)
- [Apple membership](https://developer.apple.com/support/compare-memberships/)
- [Apple review](https://developer.apple.com/app-store/review/guidelines/)
- [Shopee barang/jasa dibatasi](https://help.shopee.co.id/portal/4/article/71189-Kebijakan-Barang-yang-dilarang-dan-dibatasi)
