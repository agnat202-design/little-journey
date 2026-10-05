# Little Journey — Product Requirements & Milestones
Diperbarui: 5 Oktober 2026. Istilah standar dokumen kebutuhan produk adalah PRD; nama PRM dipertahankan agar tautan proyek tetap konsisten. [STATUS](STATUS.md) mencatat status implementasi dan bukti live.

## Tujuan dan scope
Pencatatan keluarga yang sederhana, dapat ditambah/ditemukan/diedit/dihapus, dengan sumber nilai yang jelas. MVP web Pregnancy terlebih dahulu; lifecycle anak berikutnya, Android dan monetisasi bertahap.

## Kebutuhan yang sudah diimplementasikan
- Google login/session restore; household-scoped data dan private files; sukses hanya setelah save acknowledgement, uncertain writes meminta reload.
- Profil menunjukkan email asli; edit nama keluarga dan beberapa nama anak.
- Catat Cepat membuka netral: Belanja/Pengeluaran/Checklist/Jadwal.
- Checklist CRUD + completion, satu filter kategori; tanpa PIC kosong atau target minggu.
- Belanja wajib nama, optional brand/model/estimated price/link/category/tanggal rencana/catatan. Unknown price berbeda dari explicit Rp0.
- Bought wajib actual price/date dan satu Expense; Expenses saja menghitung spending. Reverse/delete mempertahankan/menghapus hubungan sesuai flow yang sudah disepakati, tanpa double count.
- Jadwal tanggal wajib/jam optional, doctor/location/notes, tanpa cost/target minggu. Jadwalkan Lagi membuat record baru dengan tujuan/dokter/RS disalin; tanggal kosong wajib dipilih.
- Budget utama total/spent/remaining/percentage; spending categories, rencana belum terealisasi, alokasi opsional sekunder.
- Expense history CRUD/detail/attachment; Documents CRUD/private file view.
- Monthly report preview + direct PDF; JSON complete record export. Expenses/jadwal/dokumen berdasarkan tanggal bulan; checklist/shopping/budget snapshot saat ekspor. Tidak mengarang history yang belum disimpan.

## Milestones
| Milestone | Status |
| --- | --- |
| Frontend baseline, GitHub, Cloudflare | Selesai; latest deployment check tetap diperlukan |
| Database/RLS/RPC/Storage activation | Dijalankan pengguna; records produksi diperiksa |
| Google Auth dan entry akun nyata | Digunakan pengguna |
| CRUD semua fitur dan safeguards | Ada di kode; full production QA belum selesai |
| Profil, terminology cleanup, reports/PDF | Diimplementasikan dan push; acceptance/visual QA belum lengkap |
| Export/backup | JSON tersedia; binary backup dan restore belum tersedia |
| Google Play release | Belum dimulai |
| Langganan Rp10.000/bulan | Usulan; belum implementasi/validasi harga |
| English/global | Rencana; IDR-only schema sekarang |

## Release gate berikutnya
1. Verifikasi build Cloudflare terbaru, Auth restore/logout dan error handling mobile.
2. Production browser CRUD semua records, file retrieval, purchase/reverse reconciliation dan multi-session version conflict; jangan merusak data nyata saat QA.
3. Preview/PDF mobile/desktop panjang, bulan kosong, date boundaries, unknown/zero, user text escaping dan visual acceptance.
4. Perlindungan data: export/attachment coverage, restore approach dan account deletion/retention policy yang disetujui.
5. Android packaging/sign-in/file/PDF QA, policy declarations dan closed testing sebelum submission.

## Batasan tetap
Tidak ada fake promotions/recommendations/external intelligence. Tidak menyimpan credentials dalam repo. Tidak mengklaim live, historical report, backup lengkap, subscription aktif, atau approval Play Store tanpa bukti. Keputusan product/data deletion/billing dibahas sebelum implementasi yang berisiko.
