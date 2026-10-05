# Status Little Journey
Diperbarui: 5 Oktober 2026 (Asia/Jakarta).

## Posisi produk
MVP web untuk keluarga sudah terhubung ke Supabase dan digunakan pemilik untuk entry data. Belum merupakan rilis Play Store atau produk langganan. Lifecycle UI aktif masih Pregnancy; adanya tipe newborn/toddler/preschool bukan bukti flow tersebut sudah tersedia.
Produksi: https://little-journey.pages.dev/
Checkpoint sebelumnya: f64bbb6 (kode), 738e14c (dokumentasi). Penyajian Jadwal diperbarui pada tahap ini; kode dikomit setelah validasi. Deployment terakhir belum diperiksa langsung; jangan mengklaim seluruh patch live berdasarkan push saja.

## Fitur di kode saat ini
| Area | Tersedia | Batasan |
| --- | --- | --- |
| Auth | Google masuk/daftar, PKCE, pemulihan sesi, Keluar di Profil; error login lama dibersihkan | Patch pembersihan error belum browser-QA produksi |
| Keluarga | Setup ruang keluarga, HPL opsional, pilih household yang diizinkan | Belum ada undangan pasangan atau admin anggota |
| Profil | Email akun Google, edit nama keluarga, tambah/edit nama beberapa anak | Tidak ada hapus akun/retensi data; nama pribadi belum bisa diedit di Profil |
| Kehamilan | Atur/edit HPL, week/day/trimester/progress dihitung dari tanggal | Penyelesaian kehamilan/birth transition belum ada |
| Checklist | Tambah, selesai/belum selesai, Edit/Hapus dengan konfirmasi, filter kategori dari data | Tanpa target minggu dan filter minggu; tidak ada audit log perubahan status |
| Belanja | Tambah/Edit/Hapus, harga perkiraan opsional, brand/model/link/kategori/rencana beli/catatan, Bought/Reverse | Quantity ada di schema; belum ada input jumlah di form |
| Pembelian | Wajib harga aktual dan tanggal, satu Expense terkait; Rp0 hanya eksplisit | Tanpa cicilan/refund; pembatalan dapat mempertahankan riwayat sesuai pilihan pengguna |
| Pengeluaran | Tambah/Edit/Hapus, riwayat/detail, lampiran opsional | Kategori utama lima pilihan; nilai kategori lama tetap dipertahankan |
| Budget | Total, sudah keluar, sisa, persentase, pengeluaran per kategori, rencana belum terealisasi | Budget keseluruhan keluarga, bukan budget per bulan; alokasi kategori opsional sekunder |
| Jadwal | CRUD, tab Mendatang/Riwayat, urut tanggal, label Hari ini, riwayat per bulan + pagination, catatan panjang expandable, Tambah di atas, Jadwalkan Lagi | Menyalin tujuan/dokter/RS ke record baru; tanggal/jam/catatan diisi baru; tanpa target minggu/biaya |
| Dokumen | Tambah/view/Edit/Hapus, tipe dokumen, tanggal/catatan, private upload | File asli tidak ikut ekspor laporan/JSON; cleanup dapat gagal dan dilaporkan |
| Dashboard | Ringkasan dari records/HPL/budget pengguna | Tidak ada real-time subscription atau fake insights |
| Laporan | Pilih bulan, preview HTML di aplikasi, download PDF langsung, ekspor JSON | Checklist/belanja/budget merupakan snapshot saat ekspor; bukan historical month-end state |

Kategori Pengeluaran: Kesehatan (kontrol, tes, obat), Rumah sakit & persalinan, Kebutuhan anak, Kebutuhan ibu, Lainnya. Kategori opsional; istilah anak berlaku lintas usia, tetapi flow lifecycle belum dibangun.

## Bukti produksi yang sudah diperiksa
Google login dan entry pengguna ditunjukkan dalam screenshot. Kedua SQL migration berhasil dijalankan pengguna; load RPC tersedia dan menolak anonymous. Agent membaca Table Editor produksi: record Checklist, Jadwal, Shopping Bought, Expenses dan Documents ada; satu barang Bought berhubungan dengan satu Expense dengan harga sesuai. Catatan pengguna tidak disalin ke repo.
Ini membuktikan penyimpanan record yang diperiksa, bukan seluruh CRUD/attachment flow atau jaminan kehilangan data nol. Belum ada uji pemulihan backup.

## Backup dan ekspor
Dashboard Database → Backups menyatakan Free Plan tidak mencakup project backups. Free tetap digunakan untuk MVP; tidak ada upgrade berbayar.
Ekspor JSON adalah salinan catatan household terbaru, children, profil pengguna sendiri dan email. Bukan backup lengkap Supabase/Auth/Storage; tidak menyertakan binary lampiran, anggota lain, atau sistem restore. HTML/PDF adalah laporan baca, bukan data restore. Pengiriman email otomatis dan impor belum dibuat.

## Kualitas dan verifikasi
npm test, npm run lint (TypeScript), npm run build lulus pada perubahan kode terakhir. Suite mencakup business rules, komponen records, repository/rollback, config/Auth, Profil, laporan/PDF multi-halaman, dan stale login error. Schema lokal 23 checks; persistence SQL lokal 9 groups lulus pada audit sebelumnya. Build masih memberi advisory ukuran bundle/config Vite. Uji browser produksi semua mutation, logout, signed attachment dan mobile PDF masih perlu dituntaskan.
