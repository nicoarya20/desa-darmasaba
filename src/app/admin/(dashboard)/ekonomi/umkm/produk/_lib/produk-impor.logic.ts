import { buatTemplateCsvProduk } from '@/lib/umkm/produk-impor-csv';
import { unduhCsv } from '../../_com/import/impor.logic';

/** Unduh template CSV Produk dari browser (UTF-8 + BOM, pemisah ";"). Hanya jalan di browser. */
export function unduhTemplateProduk() {
  unduhCsv(buatTemplateCsvProduk(), 'template-impor-produk-umkm.csv');
}

export const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
/** Jumlah link toko online pada satu baris (untuk penanda "N link" di tabel contoh). */
export const jumlahLink = (link: Record<string, string | undefined> | undefined) => Object.values(link ?? {}).filter(Boolean).length;
