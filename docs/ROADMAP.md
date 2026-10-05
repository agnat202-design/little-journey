# Little Journey — Roadmap
Diperbarui: 5 Oktober 2026. [STATUS](STATUS.md) adalah implementasi saat ini.

## 1. Stabilkan MVP web
- Verifikasi deployment terbaru dan production flows Auth/CRUD/attachments/Shopping reverse.
- Human review preview/PDF mobile dan desktop, termasuk multi-page.
- Kebutuhan anak lintas umur: terminology sudah netral; lifecycle masih Pregnancy.
- Lengkapi salinan file/restore strategy; JSON sekarang belum mencakup binary atau import.
- Dokumentasikan retention/account deletion sebelum implementasi.

## 2. Distribusi Android
- Pilih packaging berdasarkan kemampuan web yang ada; belum ada keputusan framework wrapper.
- Android App Bundle/signing, login callback/session, upload/camera/download QA.
- Play Console identity/account setup, privacy policy, Data Safety, account deletion in-app/web, health declaration, store listing/screenshots.
- Jika akun personal baru memenuhi kondisi Google: minimal 12 tester opted-in 14 hari berturut-turut dan pengajuan produksi. Periksa ulang aturan saat submission.

## 3. Monetisasi
- Rencana rinci: [MONETIZATION](MONETIZATION.md). Web berbayar terlebih dahulu setelah validasi; Android lalu App Store.
- Harga hipotesis terbaru Rp14.900/bulan atau Rp99.000/tahun; promo awal Rp79.000 tahun pertama. Uji willingness-to-pay sebelum menetapkan.
- Tetap Supabase Free selama kuota dan kebutuhan operasional memungkinkan, termasuk pelanggan awal. Pro tidak wajib sejak awal; backup database dan file terpisah serta uji restore perlu dibuat.
- Tentukan fitur free/paid, billing model dan negara target dahulu.
- Integrasi pembayaran yang sesuai kebijakan regional Play, server receipt verification, entitlement, renewal/cancel/restore handling. Bukan sekadar menambahkan tombol bayar.
- Tidak ada upgrade Supabase/payment purchase yang diotorisasi pada checkpoint ini.

## 4. Ekspansi
- Indonesia/English UI dan laporan, currency/date/timezone tanpa perubahan nilai data lama.
- Schema sekarang currency=IDR; multi-currency membutuhkan keputusan/migration, bukan hanya translate label.
- Household invite/roles UI; birth/newborn/toddler/preschool workflows. Milestones tetap deferred.
- Email report otomatis adalah permintaan tahap berikutnya setelah laporan disetujui; belum ada jadwal, provider atau pengiriman.
- Cicilan/refund, AI/price intelligence bukan scope MVP.

## Referensi kebijakan (cek 5 Oktober 2026)
- Testing: https://support.google.com/googleplay/android-developer/answer/14151465
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Health: https://support.google.com/googleplay/android-developer/answer/16679511
- OAuth verification: https://support.google.com/cloud/answer/13463073
- Subscription fees: https://support.google.com/googleplay/android-developer/answer/112622
Kebijakan dapat berubah; tautan bukan jaminan aplikasi lolos review.
