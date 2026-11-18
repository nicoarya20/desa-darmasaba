import { buatTemplateCsvUmkm } from '@/lib/umkm/umkm-impor-csv';

/** Unduh template CSV dari browser (UTF-8 + BOM, pemisah ";"). Hanya jalan di browser. */
export function unduhTemplateUmkm() {
  const blob = new Blob([buatTemplateCsvUmkm()], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-impor-umkm.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Jumlah contoh baris/galat/peringatan yang ditampilkan di modal. */
export const PRATINJAU_BARIS = 10;
export const DAFTAR_MAKS = 20;
