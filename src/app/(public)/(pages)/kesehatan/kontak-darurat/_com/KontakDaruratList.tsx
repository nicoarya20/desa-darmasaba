'use client';
import { KontakRow, KontakRowPlaceholder } from '@/app/(public)/_com/kontak-darurat/KontakRow';
import { NationalEmergency } from '@/app/(public)/_com/kontak-darurat/NationalEmergency';
import {
  KONTAK_BRAND_VARS,
  KONTAK_SEARCH_THRESHOLD,
  type NationalEmergencyEntry,
} from '@/app/(public)/_com/kontak-darurat/kontak-darurat.meta';
import s from '@/app/(public)/_com/kontak-darurat/kontak-darurat.module.css';
import { phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { IconAmbulance, IconFirstAidKit, IconSos } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import { LayananSearch } from '../../../pemerintahan/layanan/_com/LayananSearch';
import page from '../../../pemerintahan/layanan/_com/layanan.module.css';
import { filterKontak, toPlainText } from './kontak-darurat.logic';
import { NATIONAL_EMERGENCY_NUMBERS, kontakDetailHref, type NationalEmergencyNumber } from './kontak-darurat.meta';
import { NATIONAL_TEXT as N, KONTAK_TEXT as T } from './kontak-darurat.text';
import { useKontakDaruratList, type KontakListState } from './use-kontak-darurat';

const PLACEHOLDER_ROWS = 4;
const LIST_TITLE_ID = 'kontak-darurat-desa';
const NATIONAL_ICONS: Record<NationalEmergencyNumber, NationalEmergencyEntry['icon']> = {
  '112': IconSos,
  '119': IconAmbulance,
};
const NATIONAL_ENTRIES: NationalEmergencyEntry[] = NATIONAL_EMERGENCY_NUMBERS.map((number) => ({
  number,
  ...N.items[number],
  icon: NATIONAL_ICONS[number],
}));

/** Halaman daftar Kontak Darurat Kesehatan: blok Darurat nasional (112/119), lalu semua kontak desa sekaligus. */
export function KontakDaruratList() {
  const { state, retry } = useKontakDaruratList();
  return <KontakDaruratView state={state} onRetry={retry} />;
}

/** Tampilan daftar untuk satu keadaan muat (dipisah dari hook agar bisa dirender di test). */
export function KontakDaruratView({ state, onRetry }: { state: KontakListState; onRetry: () => void }) {
  const [query, setQuery] = useState('');
  const items = useMemo(() => (state.status === 'ready' ? state.items : []), [state]);
  const visible = useMemo(() => filterKontak(items, query), [items, query]);
  const showSearch = items.length > KONTAK_SEARCH_THRESHOLD;
  // Catatan WhatsApp hanya perlu bila ada nomor yang tidak punya tombol WhatsApp (mis. telepon tetap 0361).
  const showWaNote = visible.some((item) => {
    const phone = phoneInfo(item.whatsapp);
    return phone !== null && phone.waHref === null;
  });

  return (
    <div className={page.page} style={KONTAK_BRAND_VARS}>
      <header className={page.header}>
        <BackButton />
        <div className={page.intro}>
          <h1 className={page.title}>{T.title}</h1>
          <p className={page.lead}>{T.lead}</p>
        </div>
      </header>

      <NationalEmergency entries={NATIONAL_ENTRIES} />

      <section className={page.section} aria-labelledby={LIST_TITLE_ID}>
        <div className={page.sectionHead}>
          <div className={page.sectionIntro}>
            <h2 id={LIST_TITLE_ID} className={page.sectionTitle}>
              {T.listTitle}
            </h2>
            <p className={page.sectionLead}>{T.listLead}</p>
          </div>
          {/* Cari hanya menyaring kontak desa; blok Darurat nasional di atas selalu tampil utuh. */}
          {showSearch ? (
            <LayananSearch value={query} onChange={setQuery} label={T.searchLabel} placeholder={T.searchPlaceholder} />
          ) : null}
        </div>

        {state.status === 'loading' ? (
          <ul className={s.panel} aria-busy="true" aria-label={T.loading}>
            {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
              <KontakRowPlaceholder key={i} />
            ))}
          </ul>
        ) : null}

        {state.status === 'error' ? (
          <div className={page.empty} role="alert">
            <p className={s.stateText}>{T.error}</p>
            <button type="button" className={s.retry} onClick={onRetry}>
              {T.retry}
            </button>
          </div>
        ) : null}

        {state.status === 'ready' && items.length === 0 ? <p className={page.empty}>{T.empty}</p> : null}
        {state.status === 'ready' && items.length > 0 && visible.length === 0 ? (
          <p className={page.empty}>{T.noMatch(query.trim())}</p>
        ) : null}

        {visible.length > 0 ? (
          <ul className={s.panel} aria-label={T.listLabel}>
            {visible.map((item) => (
              <KontakRow
                key={item.id}
                name={item.name}
                phone={phoneInfo(item.whatsapp)}
                icon={<IconFirstAidKit size={28} stroke={1.5} />}
                photo={item.image?.link}
                description={toPlainText(item.deskripsi)}
                href={kontakDetailHref(item.id)}
                linkLabel={T.detailLabel(item.name)}
              />
            ))}
          </ul>
        ) : null}

        {showWaNote ? <p className={s.note}>{T.waNote}</p> : null}
      </section>
    </div>
  );
}
