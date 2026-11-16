import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import { formatTanggal } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { PadesaDetail } from './PadesaDetail';
import { PadesaSummary } from './PadesaSummary';
import type { PadesView } from './padesa.logic';
import s from './padesa.module.css';
import { PADESA_TEXT as T } from './padesa.text';

/** Isi halaman untuk satu keadaan muat: kerangka berdenyut, kotak galat/kosong satu kalimat, atau ringkasan + rincian. */
export function PadesaBody({ state }: { state: LoadState<PadesView> }) {
  if (state.status === 'loading') {
    return (
      <div className={s.placeholder} aria-busy="true" aria-label={T.loading}>
        <span className={s.placeholderCard} aria-hidden />
        <span className={s.placeholderCard} aria-hidden />
        <span className={s.placeholderPanel} aria-hidden />
      </div>
    );
  }
  if (state.status === 'error') return <p className={kabar.empty} role="alert">{T.error}</p>;

  const view = state.data;
  if (view.kind === 'noApbdes') return <p className={kabar.empty}>{T.emptyNoApbdes}</p>;
  if (view.kind === 'noPades') return <p className={kabar.empty}>{T.emptyNoPades}</p>;

  const { summary } = view;
  return (
    <div className={s.content}>
      <p className={s.caption}>
        <span className={s.year}>{T.year(summary.tahun)}</span>
        {summary.updated ? (
          <time dateTime={summary.updated.toISOString()}>{T.updatedAt(formatTanggal(summary.updated))}</time>
        ) : null}
      </p>
      <PadesaSummary summary={summary} />
      <PadesaDetail rows={summary.rows} />
    </div>
  );
}
