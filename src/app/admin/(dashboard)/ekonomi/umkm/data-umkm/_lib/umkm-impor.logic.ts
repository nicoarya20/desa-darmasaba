import { buatTemplateCsvUmkm } from '@/lib/umkm/umkm-impor-csv';
import { unduhCsv } from '../../_com/import/impor.logic';

/** Unduh template CSV UMKM dari browser (UTF-8 + BOM, pemisah ";"). Hanya jalan di browser. */
export function unduhTemplateUmkm() {
  unduhCsv(buatTemplateCsvUmkm(), 'template-impor-umkm.csv');
}
