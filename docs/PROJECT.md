# Little Journey — Ringkasan Produk
Diperbarui: 5 Oktober 2026.

Little Journey adalah aplikasi pencatatan dan persiapan keluarga: Checklist, Belanja, Budget/Pengeluaran, Jadwal dan Dokumen. Visi mencakup kehamilan sampai usia anak sekitar 5 tahun; MVP saat ini masih menggunakan Pregnancy sebagai lifecycle aktif.

## Platform dan teknologi
- Web React 19 / TypeScript 7 / Vite 8 / Tailwind CSS 4.
- Lucide, Motion, logo SVG Little Journey dan mascot Pip.
- Supabase Auth Google/PKCE, PostgreSQL/RLS, private Storage.
- jsPDF + jsPDF-AutoTable: PDF dibuat di browser, dimuat ketika diunduh.
- Cloudflare Pages; GitHub main menjadi sumber deployment.
- Mata uang database saat ini IDR; timezone household default Asia/Jakarta.

## Sumber kebenaran
Expenses adalah sumber pengeluaran aktual. Shopping menyimpan estimasi dan menghubungkan pembelian ke satu Expense. Household adalah batas akses; pregnancy/child konteks opsional. Auth credentials tidak digandakan. Nilai week/day/progress dihitung, tidak disimpan.

## Status dan arah bisnis
Lihat [STATUS](STATUS.md), [PRM](PRM.md) dan [ROADMAP](ROADMAP.md). Android/Play Store, English/global, pembayaran dan langganan belum tersedia. Rp10.000/bulan baru usulan harga untuk diuji, bukan plan aktif atau janji revenue.
Tidak ada Supabase realtime subscriptions, AI/promosi/pricing eksternal, onboarding semua lifecycle, atau email otomatis.
