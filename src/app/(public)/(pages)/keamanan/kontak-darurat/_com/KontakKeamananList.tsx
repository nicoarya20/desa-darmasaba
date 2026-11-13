'use client';
import { KontakRow, KontakRowPlaceholder } from '@/app/(public)/_com/kontak-darurat/KontakRow';
import { NationalEmergency } from '@/app/(public)/_com/kontak-darurat/NationalEmergency';
import { KONTAK_BRAND_VARS, KONTAK_SEARCH_THRESHOLD } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.meta';
import s from '@/app/(public)/_com/kontak-darurat/kontak-darurat.module.css';
import { phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { IconMapper, type IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import { useMemo, useState } from 'react';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import { LayananSearch } from '../../../pemerintahan/layanan/_com/LayananSearch';
import page from '../../../pemerintahan/layanan/_com/layanan.module.css';
import { countItems, filterGroups, type KontakGroup } from './kontak-keamanan.logic';
import { KEAMANAN_NATIONAL_ENTRIES } from './kontak-keamanan.meta';
import g from './kontak-keamanan.module.css';
import { KEAMANAN_TEXT as T } from './kontak-keamanan.text';
import { useKontakKeamanan, type KontakKeamananState } from './use-kontak-keamanan';

const PLACEHOLDER_ROWS = 3;
const LIST_TITLE_ID = 'kontak-keamanan-wilayah';
const EMPTY_GROUPS: KontakGroup[] = [];

/** Halaman Kontak Darurat Keamanan: blok Darurat nasional, lalu semua kontak wilayah per kategori. */
export function KontakKeamananList() {
  const { state, retry } = useKontakKeamanan();
  return <KontakKeamananView state={state} onRetry={retry} />;
}

/** Tampilan untuk satu keadaan muat (dipisah dari hook agar bisa dirender di test). */
export function KontakKeamananView({ state, onRetry }: { state: KontakKeamananState; onRetry: () => void }) {
  const [query, setQuery] = useState('');
  const groups = state.status === 'ready' ? state.groups : EMPTY_GROUPS;
  const visible = useMemo(() => filterGroups(groups, query), [groups, query]);
  const showSearch = countItems(groups) > KONTAK_SEARCH_THRESHOLD;
  // Catatan WhatsApp hanya perlu bila ada nomor yang tidak punya tombol WhatsApp (mis. telepon tetap 0361).
  const showWaNote = visible.some((group) =>
    group.items.some((item) => {
      const phone = phoneInfo(item.nomorTelepon);
      return phone !== null && phone.waHref === null;
    }),
  );

  return (
    <div className={page.page} style={KONTAK_BRAND_VARS}>
      <header className={page.header}>
        <BackButton />
        <div className={page.intro}>
          <h1 className={page.title}>{T.title}</h1>
          <p className={page.lead}>{T.lead}</p>
        </div>
      </header>

      <NationalEmergency entries={KEAMANAN_NATIONAL_ENTRIES} />

      <section className={page.section} aria-labelledby={LIST_TITLE_ID}>
        <div className={page.sectionHead}>
          <div className={page.sectionIntro}>
            <h2 id={LIST_TITLE_ID} className={page.sectionTitle}>
              {T.listTitle}
            </h2>
            <p className={page.sectionLead}>{T.listLead}</p>
          </div>
          {/* Cari hanya menyaring kontak wilayah; blok Darurat nasional di atas selalu tampil utuh. */}
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

        {state.status === 'ready' && groups.length === 0 ? <p className={page.empty}>{T.empty}</p> : null}
        {state.status === 'ready' && groups.length > 0 && visible.length === 0 ? (
          <p className={page.empty}>{T.noMatch(query.trim())}</p>
        ) : null}

        {visible.length > 0 ? (
          <div className={g.groups}>
            {visible.map((group) => (
              <KontakGroupBlock key={group.id} group={group} />
            ))}
          </div>
        ) : null}

        {showWaNote ? <p className={s.note}>{T.waNote}</p> : null}
      </section>
    </div>
  );
}

/** Satu kategori: judul berikon (h3) + panel baris kontak (nama h4). */
function KontakGroupBlock({ group }: { group: KontakGroup }) {
  const titleId = `kontak-kategori-${group.id}`;
  return (
    <div className={g.group}>
      <h3 id={titleId} className={g.groupTitle}>
        {group.icon ? (
          <span className={g.groupIcon} aria-hidden>
            <IconMapper name={group.icon as IconKey} size={20} />
          </span>
        ) : null}
        {group.nama}
      </h3>
      <ul className={s.panel} aria-labelledby={titleId}>
        {group.items.map((item) => (
          <KontakRow
            key={item.key}
            name={item.nama}
            nameAs="h4"
            phone={phoneInfo(item.nomorTelepon)}
            icon={item.icon ? <IconMapper name={item.icon as IconKey} size={28} /> : null}
          />
        ))}
      </ul>
    </div>
  );
}
