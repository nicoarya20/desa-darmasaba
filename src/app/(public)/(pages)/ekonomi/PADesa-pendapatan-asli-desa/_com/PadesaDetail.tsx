import type { DetailRow } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { accentVars } from '@/app/(public)/_com/main-page/apbdes/apbdes.meta';
import apb from '@/app/(public)/_com/main-page/apbdes/apbdes.module.css';
import { ApbdesRows } from '@/app/(public)/_com/main-page/apbdes/components/ApbdesDetail';
import { PADESA_TEXT as T } from './padesa.text';

const TITLE_ID = 'padesa-detail-title';

/** Panel rincian pos 4.x PADes memakai baris rincian APBDes (kode, uraian berindentasi, realisasi, anggaran). */
export function PadesaDetail({ rows }: { rows: readonly DetailRow[] }) {
  return (
    <section className={apb.panel} style={accentVars('pendapatan')} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={apb.panelTitle}>
        {T.detailTitle}
      </h2>
      <ApbdesRows rows={rows} />
    </section>
  );
}
