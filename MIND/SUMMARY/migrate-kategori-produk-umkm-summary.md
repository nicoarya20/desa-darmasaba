# Summary: Migrasi KategoriProduk → KategoriProdukUmkm

## Perubahan yang Dilakukan
1. **Schema Prisma**:
   - Memisahkan model kategori untuk `Umkm` dan `PasarDesa`.
   - `Umkm` sekarang menggunakan `KategoriProdukUmkm`.
   - `PasarDesa` tetap menggunakan `KategoriProduk`.
   - Menghapus relasi `Umkm` dari model `KategoriProduk`.
2. **Database**:
   - Menjalankan `prisma db push` untuk memperbarui tabel di PostgreSQL.
   - Menyiapkan dan menguji script migrasi data (tabel saat ini kosong, namun script sudah diverifikasi).
3. **Backend API**:
   - Mengubah `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/kategori-produk/kategori-produk.ts` agar menggunakan `prisma.kategoriProdukUmkm`.
   - Memperbarui logic KPI dashboard di `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/dashboard/kpi.ts` untuk menggunakan model kategori yang tepat berdasarkan konteks (UMKM vs Penjualan).
4. **Validasi**:
   - Berhasil menjalankan `bun run build` tanpa error TypeScript baru.

## Dampak
- Admin UMKM sekarang memiliki manajemen kategori yang terisolasi dari PasarDesa.
- Tidak ada perubahan pada UI karena path API dan struktur data tetap sama.
- Kompabilitas data tetap terjaga karena relasi menggunakan ID yang sama.

## File Terkait
- `prisma/schema.prisma`
- `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/kategori-produk/kategori-produk.ts`
- `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/dashboard/kpi.ts`
