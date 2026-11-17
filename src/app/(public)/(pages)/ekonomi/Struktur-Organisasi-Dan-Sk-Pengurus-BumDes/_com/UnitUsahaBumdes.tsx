import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { ProgramTilesPlaceholder } from '@/app/(public)/_com/program-tiles/ProgramTiles';
import t from '@/app/(public)/_com/program-tiles/program-tiles.module.css';
import { IconBuildingStore } from '@tabler/icons-react';
import type { UnitUsaha } from './bumdes.logic';
import s from './bumdes.module.css';
import { BUMDES_TEXT } from './bumdes.text';

const T = BUMDES_TEXT.unitUsaha;
const TITLE_ID = 'bumdes-unit-usaha-title';
const PLACEHOLDER_TILES = 3;

/**
 * Bagian "Unit Usaha": ubin `#f5f5f7` program-tiles (3/2/1 kolom) tanpa tautan, karena belum ada halaman detail unit.
 * Ubin = foto (atau ikon toko), nama, deskripsi penuh. Memuat → ubin berdenyut; kosong/galat → satu kotak kalimat.
 */
export function UnitUsahaBumdes({ state }: { state: LoadState<UnitUsaha[]> }) {
  return (
    <section className={s.block} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.blockTitle}>
        {T.title}
      </h2>
      {state.status === 'loading' ? (
        <ProgramTilesPlaceholder count={PLACEHOLDER_TILES} label={T.loading} />
      ) : state.status === 'error' || state.data.length === 0 ? (
        <p className={kabar.empty}>{state.status === 'error' ? T.error : T.empty}</p>
      ) : (
        <ul className={t.tiles} aria-label={T.listLabel}>
          {state.data.map((unit) => (
            <li key={unit.id}>
              <article className={t.tile}>
                {unit.image ? (
                  <img src={unit.image} alt="" className={s.unitImage} loading="lazy" />
                ) : (
                  <span className={t.icon} aria-hidden>
                    <IconBuildingStore size={32} stroke={1.5} />
                  </span>
                )}
                <h3 className={t.title}>{unit.nama}</h3>
                {unit.deskripsi ? <p className={s.unitDesc}>{unit.deskripsi}</p> : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
