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

### Upload foto — 5 Oktober 2026
Foto JPG/PNG/WebP baru di atas 400 KB diperkecil sebelum upload (sisi terpanjang maksimal 2200 px, target sekitar 600 KB; hasil bergantung isi foto). File kecil dan PDF tetap asli. Daftar menampilkan jenis dan ukuran, bukan nama panjang. Teks prototipe lokal di Dokumen dihapus. Penggantian tetap menyimpan metadata baru sebelum menghapus file lama; kegagalan cleanup diberi peringatan. Foto lama tidak dikompres ulang.

- 5 Oktober 2026: tombol Tambah Checklist selalu tersedia di atas filter kategori, termasuk saat daftar sudah berisi. Menggunakan alur tambah checklist yang sama.

- 5 Oktober 2026: tambah/edit Checklist memiliki catatan dan target tanggal opsional yang tersimpan melalui target_date. Kartu menampilkan tanggal. Catatan otomatis Catat Cepat tidak lagi dibuat; teks lama disembunyikan dan dikosongkan saat diedit, tanpa menghapus catatan pengguna lain.

## Rencana monetisasi — 5 Oktober 2026
Lihat [MONETIZATION.md](MONETIZATION.md). Prioritas biaya pengguna: tetap Supabase Free untuk MVP/pelanggan awal sesuai kuota, tanpa kewajiban Pro saat pelanggan pertama. Backup database dan foto terpisah, uji restore, monitoring dan kuota keluarga belum lengkap dan menjadi pekerjaan sebelum komitmen layanan berbayar. Harga dan kanal adalah usulan untuk diuji; pembayaran, upgrade, listing Shopee dan submission store belum dilakukan.

## 20 Oktober 2026 — Pencarian global
Kolom Cari semua catatan tersedia di seluruh menu: Dokumen, Pengeluaran, Jadwal, Checklist dan Belanja. Mencari judul/catatan/kategori, dokter/RS, brand/model/toko dan nama lampiran; mendukung lab/laboratorium, filter jenis, hasil bertahap dan detail dengan buka lampiran. Memakai data household aktif yang telah dimuat; tidak menambah API eksternal/schema. Belum OCR/isi PDF dan bukan pencarian semantik medis.

## 20 Oktober 2026 — Kabar pembaruan
Banner kecil non-modal setelah login, dapat ditutup; maksimal 3 kali per versi pada browser/perangkat yang sama via localStorage. Pindah menu tidak menghitung ulang; membuka ulang/memuat ulang aplikasi menghitung satu tampilan. Browser lain atau data browser dihapus memiliki hitungan baru; storage diblokir berarti banner tidak ditampilkan. Profil selalu memuat versi/tanggal dan daftar pembaruan singkat. Setiap fitur yang dirilis harus memperbarui src/lib/releases.ts dengan versi unik dan bahasa awam; bukan notifikasi push/alarm.

## 1 November 2026 — Tambah sesuai konteks
Audit tombol tambah: Shopping langsung RecordEditor shopping; Checklist form khusus tanpa pemilih jenis; Budget, Jadwal dan Dokumen tetap langsung form masing-masing. Catat Cepat global desktop/mobile menyediakan lima pilihan termasuk Dokumen dan memulai netral setiap dibuka. Dokumen memakai upload/persistensi yang sama. Release notice 1.2.0 diperbarui dan ringkasan banner kini mengikuti sumber versi.

## 1 November 2026 — Bahasa menu lebih sederhana
Navigasi desktop/mobile: Beranda, Checklist, Belanja, Keuangan, Jadwal Kontrol, Dokumen, Profil. Label kategori dan prioritas diterjemahkan untuk tampilan tanpa mengubah nilai database; istilah anggaran diperjelas. Tombol Tambah Barang dipindah ke atas daftar; petunjuk centang ditambahkan di Checklist; badge minggu/hari tanpa singkatan W/D. Release 1.3.0. Tidak mengubah perhitungan atau migrasi data.

## 1 November 2026 — Rencana Biaya (aktivasi database diperlukan)
Expense total_amount nullable ditambahkan secara additive melalui 202611010001_planned_costs.sql dan whitelist RPC diperbarui. Null berarti biaya sama dengan paid_amount untuk kompatibilitas transaksi lama. Rencana manual: paid_amount=0, total_amount>0, expense_date=rencana tanggal bayar. Keuangan/Beranda menampilkan proyeksi actual + outstanding + rencana barang; tidak dianggap pengeluaran sampai dibayar. Pembayaran penuh mengubah record yang sama dan tanggal menjadi tanggal bayar, mendukung nominal aktual berbeda tanpa double count; cicilan/multi-payment ledger belum tersedia. Edit/hapus rencana tersedia. Laporan memisahkan rencana snapshot dari transaksi bulan, JSON mencakup total. Modal memeriksa kolom sebelum menyimpan agar schema lama tidak menghilangkan rencana diam-diam. Migrasi produksi belum dijalankan/diverifikasi.

## 1 November 2026 — Struk tambahan dan tanda rencana
Rencana/pembayaran, pengeluaran dan dokumen mendukung satu lampiran utama + dua tambahan (maksimal 3 total). Tambahan disimpan attachment_extras JSONB dengan validasi jalur household, jumlah dan ukuran; RPC whitelist diperbarui. Upload baru dikompres sebagaimana lampiran utama, rollback membersihkan file baru, cleanup file lama baru setelah metadata tersimpan. Rencana belum dibayar berwarna merah muda dengan label teks. Migrasi 202611010002_multiple_attachments.sql diperlukan setelah 001; aktivasi produksi belum dilakukan.

## 1 November 2026 — Label realisasi dan proyeksi
Kartu atas Keuangan bernama Realisasi Pengeluaran dengan Sudah Dibayar; keterangannya mengecualikan rencana. Kartu bawah Proyeksi Pengeluaran mencakup pembayaran dan biaya mendatang. Nilai anggaran awal dan sisa tetap ditampilkan sebagai pembanding. Perhitungan tidak berubah. Release 1.5.1.

## 1 November 2026 — Penyempurnaan mobile 1.6.0
Header ringkas dengan logo/Profil, satu baris Jadwal-Dokumen-Lainnya; HPL dan Laporan tetap tersedia melalui Lainnya di HP. Navigasi bawah memakai safe-area, label Catat, active state tidak salah menandai Beranda di menu lain. Kontrol sentuh minimal 44 px, form 16 px di layar kecil untuk mencegah zoom iOS, focus-visible dan reduced-motion. Lampiran tambahan dilipat saat kosong. QA visual lokal memakai data contoh, bukan sesi/data produksi.

QA mobile lokal 1.6.0: viewport 390×844 dan 320×740, navigasi/Catat Cepat/form Pengeluaran diperiksa. Tidak ada overflow horizontal halaman pada 320 px (scrollWidth 314, viewport 320). Pemilih jenis Catat Cepat memakai dua kolom di layar sangat kecil agar label tidak terpotong. Screenshot lokal tmp/mobile-after.png; fixture tidak masuk build/repo dan tidak memakai data produksi.

## 2 November 2026 — Aktivasi produksi terverifikasi
Login operator agnat202-design pada project Little Journey dikonfirmasi. Pemeriksaan awal information_schema menunjukkan total_amount/attachment_extras belum ada. Setelah persetujuan eksplisit pengguna terhadap peringatan Supabase, migrasi 202611010001 dan 202611010002 dijalankan dan keduanya Success. Uji RPC database produksi dalam BEGIN/ROLLBACK berhasil: simpan rencana unpaid, baca ulang total dan metadata lampiran tambahan, ubah menjadi pembayaran aktual pada ID sama, tepat satu record; seluruh perubahan uji di-rollback. Ini verifikasi RPC melalui SQL Editor role postgres dengan auth.uid disetel ke anggota aktif, bukan bukti submit browser akun pengguna/RLS role authenticated atau upload file binary produksi. Tes lokal tenant/rollback sebelumnya tetap berlaku. Form pengguna yang gagal sebelum onsave dapat dicoba simpan ulang tanpa menutup isian. Bukti screenshot lokal tmp/database-activation-verified.png (tidak dikomit).

## 2 November 2026 — Pemisah ribuan input uang
Input nominal di rencana/pembayaran, pengeluaran/belanja, harga beli, dan anggaran menampilkan titik ribuan otomatis. Form state dan database tetap numerik tanpa grouping; koma desimal didukung hanya sejauh validasi nominal fitur terkait mengizinkan. Keyboard angka HP via inputMode. Release 1.6.1. Tidak ada migrasi database.

## 2 November 2026 — Kebutuhan Mendatang 1.7.0
Keuangan memisahkan biaya belum dibayar dan barang belum dibeli menjadi kelompok/kartu dengan subtotal dan total perlu disiapkan. Warna lembut per jenis; tanggal biaya yang lewat memakai label dan penekanan merah, bukan status pasti terlambat membayar. Biaya diurutkan tanggal, unknown-price barang disebutkan, link ke Belanja tersedia, hapus rencana ditempatkan di Lainnya dengan konfirmasi lama. Rumus proyeksi memakai kalkulasi existing; tanpa migrasi.

## 4 November 2026 — UI 2.0
Beranda dibangun ulang dengan prioritas jadwal terdekat (2), persiapan berikut (3), akses cepat, ringkasan keuangan actual/proyeksi tanpa informasi berulang. Hero kehamilan dipadatkan, data tetap dari HPL. Dokumen: pencarian lokal judul/catatan/jenis/nama file, filter jenis, urutan terbaru/terlama/nama; informasi penyimpanan dilipat. Checklist: filter semua/belum selesai/selesai. Tidak menambah asumsi kesehatan, tracker pertumbuhan atau rekomendasi vaksin dari screenshot referensi; fitur-fitur itu memerlukan model data dan validasi tersendiri. Tanpa migrasi database.
