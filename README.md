# HCID - ATMS

Aplikasi **ATMS (Asset Traffic Monitoring System)** untuk mengelola inventaris 153 site CCTV/ETLE/VDS/FIX/PTZ, koordinat, IP perangkat, status pekerjaan, provider data koordinat, dan ID meteran listrik.

## Fitur

- Dashboard ringkasan total site, status completed, problem/not found, dan jumlah wilayah.
- Filter berdasarkan pencarian bebas, wilayah, tipe kamera, status, dan provider.
- Tabel daftar site lengkap dengan tautan Google Maps dari koordinat.
- Panel detail site terpilih dan ringkasan visual status/tipe.
- Form tambah, edit, dan hapus site dengan penyimpanan di `localStorage` browser.
- Export CSV dan import CSV untuk pertukaran data.
- Mode terang/gelap.

## Menjalankan aplikasi

Karena aplikasi ini statis, cukup buka `index.html` langsung di browser atau jalankan server lokal:

```bash
python3 -m http.server 8080
```

Lalu buka `http://localhost:8080`.

## Catatan keamanan

Seed data tidak menyimpan password asli. Untuk penggunaan produksi, jangan menaruh password perangkat di frontend statis. Simpan kredensial di backend terenkripsi/secret vault dan batasi akses berdasarkan role pengguna.
