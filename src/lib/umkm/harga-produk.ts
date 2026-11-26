// Harga produk UMKM opsional (sebagian produk desa harganya tidak tetap) — murni, dipakai admin, publik, dan Jenna.

/** Teks pengganti di website publik untuk produk tanpa harga. */
export const HARGA_MENYESUAIKAN = 'Harga menyesuaikan';

/** Keterangan isian harga di form Tambah/Ubah Produk. */
export const HARGA_INPUT_KETERANGAN = `Opsional. Kosongkan bila harga tidak tetap; di website tampil "${HARGA_MENYESUAIKAN}".`;

/** Nilai NumberInput Mantine → harga: kosong / bukan angka → null (bukan 0, agar tidak tampil "Rp0"). */
export function hargaDariInput(val: string | number): number | null {
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  if (val.trim() === '') return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

/** Harga di tabel admin, mis. "Rp 80.000"; kosong → "-". */
export function formatHargaAdmin(harga: number | null | undefined): string {
  return harga == null ? '-' : `Rp ${harga.toLocaleString('id-ID')}`;
}
