/** Unduh teks CSV dari browser (UTF-8, isi sudah memuat BOM). Hanya jalan di browser. */
export function unduhCsv(isi: string, namaBerkas: string) {
  const blob = new Blob([isi], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaBerkas;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Jumlah contoh baris/galat/peringatan yang ditampilkan di modal. */
export const PRATINJAU_BARIS = 10;
export const DAFTAR_MAKS = 20;
