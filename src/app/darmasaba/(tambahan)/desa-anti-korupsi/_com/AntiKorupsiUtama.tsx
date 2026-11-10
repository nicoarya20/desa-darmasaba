import { AntiKorupsiGroups } from '@/app/darmasaba/_com/main-page/desaantikorupsi/AntiKorupsiGroups';
import s from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.module.css';
import { ANTIKORUPSI_TEXT } from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.text';
import type { AntiKorupsiGroup } from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import { utamaItemHref, type AntiKorupsiUtamaView } from '../_lib/antikorupsi-utama.logic';
import { AK_UTAMA_TEXT } from './antikorupsi-utama.text';

const TITLE_ID = 'desa-anti-korupsi-utama-title';

/** Isi halaman utama Desa Anti Korupsi bergaya section beranda: judul, ringkasan angka, semua indikator bertaut. */
export function AntiKorupsiUtama({ view, loading }: { view: AntiKorupsiUtamaView; loading: boolean }) {
  const empty = !loading && view.groups.length === 0;
  const kategoriHref = (group: AntiKorupsiGroup) => view.kategoriLinks[group.id];

  return (
    <section aria-labelledby={TITLE_ID}>
      <header className={s.header}>
        <h1 id={TITLE_ID} className={s.title}>
          {ANTIKORUPSI_TEXT.title}
        </h1>
        <p className={s.lead}>{ANTIKORUPSI_TEXT.lead}</p>
        {!loading && !empty ? <p className={s.ringkasan}>{AK_UTAMA_TEXT.ringkasan(view.ringkasan)}</p> : null}
      </header>

      <div aria-busy={loading || undefined}>
        {loading ? <span className={s.srOnly}>{ANTIKORUPSI_TEXT.loading}</span> : null}
        {empty ? (
          <p className={s.empty}>{ANTIKORUPSI_TEXT.empty}</p>
        ) : (
          <AntiKorupsiGroups
            groups={view.groups}
            loading={loading}
            itemHref={utamaItemHref}
            kategoriHref={kategoriHref}
          />
        )}
      </div>
    </section>
  );
}
