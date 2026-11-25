import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import p from '../pencegahan.module.css';
import { TipCard } from './TipCard';
import { TIPS_SECTION_ID } from './tips-keamanan.meta';
import s from './tips-keamanan.module.css';
import { TIPS_KEAMANAN_TEXT as T } from './tips-keamanan.text';
import type { TipsKeamananState } from './use-tips-keamanan';

const TITLE_ID = `${TIPS_SECTION_ID}-judul`;
const PLACEHOLDER_TIPS = 2;

/**
 * Bagian "Tips keamanan" di bawah program pencegahan: judul `h2` + pengantar, lalu semua ubin tips (dibaca langsung,
 * tanpa detail). Tidak dirender bila tidak ada tips (atau tidak ada yang cocok dengan kata kunci).
 */
export function TipsSection({ state }: { state: TipsKeamananState }) {
  if (state.status === 'ready' && state.tips.length === 0) return null;

  return (
    <section id={TIPS_SECTION_ID} className={`${p.block} ${s.section}`} aria-labelledby={TITLE_ID}>
      <div className={s.intro}>
        <h2 id={TITLE_ID} className={p.blockTitle}>
          {T.title}
        </h2>
        <p className={s.lead}>{T.lead}</p>
      </div>
      {state.status === 'loading' ? (
        <ul className={s.tips} aria-busy="true" aria-label={T.loading}>
          {Array.from({ length: PLACEHOLDER_TIPS }, (_, i) => (
            <li key={i} className={`${s.tip} ${kabar.placeholder}`} aria-hidden />
          ))}
        </ul>
      ) : null}
      {state.status === 'error' ? (
        <p className={kabar.empty} role="alert">
          {T.error}
        </p>
      ) : null}
      {state.status === 'ready' ? (
        <ul className={s.tips} aria-label={T.listLabel}>
          {state.tips.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
