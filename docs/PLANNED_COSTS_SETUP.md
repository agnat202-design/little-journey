# Aktifkan Rencana Biaya
1 November 2026. Kode siap; migrasi produksi belum dijalankan oleh agent.

1. Buka project Supabase Little Journey → SQL Editor → New query.
2. Salin seluruh isi [202611010001_planned_costs.sql](../supabase/migrations/202611010001_planned_costs.sql).
3. Klik Run sekali. Script menambah kolom dan memperbarui fungsi simpan dalam transaksi; tidak menghapus data.
4. Setelah Success, muat ulang Little Journey. Keuangan → Rencana Biaya.
5. Coba satu rencana kecil, muat ulang untuk memastikan tersimpan; periksa proyeksi dan bahwa Sudah Keluar belum naik. Hapus data uji setelah selesai. Pembayaran nyata hanya dicatat saat benar-benar terjadi.

Jangan menjalankan ulang migrasi awal atau mereset database. Jika ada error, kirim pesan error; transaksi script akan rollback. Jangan menganggap fitur aktif sebelum sukses dan QA produksi. Backup penuh masih pekerjaan terpisah.

## Tambahan lampiran
Setelah migrasi 001 berhasil, jalankan [202611010002_multiple_attachments.sql](../supabase/migrations/202611010002_multiple_attachments.sql) sekali untuk maksimal 3 lampiran. Jika 001 sudah dijalankan, jangan ulangi; cukup 002. Refresh aplikasi sesudah Success. File utama lama tetap kompatibel; tidak dihapus oleh migrasi.

## 2 November 2026 — Aktivasi produksi terverifikasi
Login operator agnat202-design pada project Little Journey dikonfirmasi. Pemeriksaan awal information_schema menunjukkan total_amount/attachment_extras belum ada. Setelah persetujuan eksplisit pengguna terhadap peringatan Supabase, migrasi 202611010001 dan 202611010002 dijalankan dan keduanya Success. Uji RPC database produksi dalam BEGIN/ROLLBACK berhasil: simpan rencana unpaid, baca ulang total dan metadata lampiran tambahan, ubah menjadi pembayaran aktual pada ID sama, tepat satu record; seluruh perubahan uji di-rollback. Ini verifikasi RPC melalui SQL Editor role postgres dengan auth.uid disetel ke anggota aktif, bukan bukti submit browser akun pengguna/RLS role authenticated atau upload file binary produksi. Tes lokal tenant/rollback sebelumnya tetap berlaku. Form pengguna yang gagal sebelum onsave dapat dicoba simpan ulang tanpa menutup isian. Bukti screenshot lokal tmp/database-activation-verified.png (tidak dikomit).
