# Dokumentasi Little Journey
Diperbarui: 5 Oktober 2026. Dokumentasi mengikuti kode, bukti deployment, dan keputusan pengguna; ketiganya dibedakan.

| Dokumen | Isi |
| --- | --- |
| [STATUS.md](STATUS.md) | Status produk, fitur tersedia, bukti produksi, dan batasan |
| [PRM.md](PRM.md) | Product Requirements & Milestones: kebutuhan produk dan kriteria selesai |
| [PROJECT.md](PROJECT.md) | Ringkasan produk dan teknologi |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Alur frontend, Auth, database, Storage, laporan |
| [DATABASE.md](DATABASE.md) | Struktur data dan keputusan schema |
| [MONETIZATION.md](MONETIZATION.md) | Rencana harga/kanal, tetap Supabase Free, backup dan pemicu upgrade |
| [ROADMAP.md](ROADMAP.md) | Urutan kerja berikutnya, Android, langganan, internasionalisasi |
| [MVP_PERSISTENCE_QA.md](MVP_PERSISTENCE_QA.md) | Tes yang dijalankan, bukti produksi, bagian belum diverifikasi |
| [DATA_PROVENANCE.md](DATA_PROVENANCE.md) | Sumber nilai yang ditampilkan |
| [GOOGLE_AUTH.md](GOOGLE_AUTH.md) | Konfigurasi login Google |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat perubahan |
| [DECISIONS.md](DECISIONS.md) | Keputusan arsitektur; entri awal adalah catatan historis |

## Aturan pembaruan
Setiap perubahan fitur memperbarui STATUS, PRM/ROADMAP jika scope berubah, dan CHANGELOG. Perubahan database/penyimpanan memperbarui ARCHITECTURE/DATABASE. Hasil tes dan bukti live ditulis pada QA. Jangan menandai push sebagai deployment terverifikasi, atau tes lokal sebagai QA produksi. Catat keterbatasan ekspor/backup. Jangan simpan credentials, data keluarga, atau isi dokumen pribadi dalam dokumentasi.
Dokumen PRODUCT_QA dan UX berisi checkpoint historis; gunakan STATUS dan PRM untuk status terbaru.
