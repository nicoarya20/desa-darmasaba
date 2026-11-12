'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import page from '../../../pemerintahan/layanan/_com/layanan.module.css';
import { KontakRowPlaceholder } from '@/app/(public)/_com/kontak-darurat/KontakRow';
import k from '@/app/(public)/_com/kontak-darurat/kontak-darurat.module.css';
import { PolsekMapPanel } from './PolsekMapPanel';
import { PolsekRow } from './PolsekRow';
import { mapEmbedSrc, parseJarakKm, pickMapPolsek, sortByJarak } from './polsek.logic';
import { POLSEK_BRAND_VARS } from './polsek.meta';
import { POLSEK_TEXT as T } from './polsek.text';
import { usePolsekList, type PolsekListState } from './use-polsek';

const PLACEHOLDER_ROWS = 4;
const LIST_TITLE_ID = 'polsek-daftar';

/** Halaman Polsek Terdekat: semua kantor polisi urut jarak (call-first), lalu satu peta untuk polsek terpilih. */
export function PolsekTerdekatPage() {
  const { state, retry } = usePolsekList();
  return <PolsekTerdekatView state={state} onRetry={retry} />;
}

/** Tampilan untuk satu keadaan muat (dipisah dari hook agar bisa dirender di test). */
export function PolsekTerdekatView({ state, onRetry }: { state: PolsekListState; onRetry: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<HTMLElement>(null);
  const items = useMemo(() => (state.status === 'ready' ? sortByJarak(state.items) : []), [state]);
  const mapItems = useMemo(() => items.filter((item) => mapEmbedSrc(item.embedMapUrl) !== null), [items]);
  const onMap = pickMapPolsek(items, selectedId);
  // "Terdekat" hanya bila jaraknya memang diketahui (bukan sekadar baris pertama).
  const nearestId = items.length > 1 && parseJarakKm(items[0].jarakKeDesa) !== null ? items[0].id : null;

  const showOnMap = useCallback((id: string) => {
    setSelectedId(id);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mapRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, []);

  return (
    <div className={page.page} style={POLSEK_BRAND_VARS}>
      <header className={page.header}>
        <BackButton />
        <div className={page.intro}>
          <h1 className={page.title}>{T.title}</h1>
          <p className={page.lead}>{T.lead}</p>
        </div>
      </header>

      <section className={page.section} aria-labelledby={LIST_TITLE_ID}>
        <div className={page.sectionIntro}>
          <h2 id={LIST_TITLE_ID} className={page.sectionTitle}>
            {T.listTitle}
          </h2>
          <p className={page.sectionLead}>{T.listLead}</p>
        </div>

        {state.status === 'loading' ? (
          <ul className={k.panel} aria-busy="true" aria-label={T.loading}>
            {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
              <KontakRowPlaceholder key={i} />
            ))}
          </ul>
        ) : null}

        {state.status === 'error' ? (
          <div className={page.empty} role="alert">
            <p className={k.stateText}>{T.error}</p>
            <button type="button" className={k.retry} onClick={onRetry}>
              {T.retry}
            </button>
          </div>
        ) : null}

        {state.status === 'ready' && items.length === 0 ? <p className={page.empty}>{T.empty}</p> : null}

        {items.length > 0 ? (
          <ul className={k.panel} aria-label={T.listLabel}>
            {items.map((item) => (
              <PolsekRow
                key={item.id}
                item={item}
                nearest={item.id === nearestId}
                onMap={item.id === onMap?.id}
                onShowOnMap={showOnMap}
              />
            ))}
          </ul>
        ) : null}
      </section>

      {onMap ? <PolsekMapPanel ref={mapRef} items={mapItems} selected={onMap} onSelect={setSelectedId} /> : null}
    </div>
  );
}
