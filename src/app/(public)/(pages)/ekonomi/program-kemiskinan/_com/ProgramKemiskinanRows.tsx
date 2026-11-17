import rows from '@/app/(public)/(pages)/lingkungan/data-lingkungan-desa/_com/data-lingkungan.module.css';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { paginate } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { filterProgramKemiskinan, programKemiskinanEmptyMessage, type ProgramKemiskinan } from './program-kemiskinan.logic';
import { PROGRAM_KEMISKINAN_PAGE_SIZE } from './program-kemiskinan.meta';
import s from './program-kemiskinan.module.css';
import { PROGRAM_KARTU_TEXT, PROGRAM_KEMISKINAN_TEXT as T } from './program-kemiskinan.text';

// Baris bergaris memakai CSS Data Lingkungan Desa apa adanya (pola Kolaborasi Inovasi), bukan salinan.
const PLACEHOLDER_ROWS = 3;

type Props = {
  state: LoadState<ProgramKemiskinan[]>;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Daftar program untuk satu keadaan muat: kerangka, pesan kosong/galat, atau baris + paginasi klien (diekspor untuk test). */
export function ProgramKemiskinanRows({ state, search, page, onPage }: Props) {
  if (state.status === 'loading') {
    return (
      <ul className={rows.rows} aria-busy="true" aria-label={T.loading}>
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
          <li key={i} className={rows.placeholderRow} aria-hidden />
        ))}
      </ul>
    );
  }

  const matches = state.status === 'ready' ? filterProgramKemiskinan(state.data, search) : [];
  if (matches.length === 0) {
    return <p className={kabar.empty}>{programKemiskinanEmptyMessage(search, state.status === 'error')}</p>;
  }

  const current = paginate(matches, page, PROGRAM_KEMISKINAN_PAGE_SIZE);
  return (
    <>
      <ul className={rows.rows} aria-label={T.listLabel}>
        {current.items.map((item) => (
          <ProgramKemiskinanRow key={item.id} item={item} />
        ))}
      </ul>
      <KabarListPagination total={current.totalPages} value={current.page} label={T.paginationLabel} onChange={onPage} />
    </>
  );
}

/**
 * Satu baris bergaris: kiri ikon + nama program (tautan ke detail penerima) + aksi "Lihat penerima bantuan ›", kanan
 * deskripsi (HTML sudah disaring di `toProgramKemiskinan`). Baris tidak dibungkus satu `<a>` karena deskripsi CMS bisa
 * berisi tautan; aksi kedua hanya penanda visual (keluar dari urutan tab & pohon aksesibilitas), tautan utama = judul.
 */
export function ProgramKemiskinanRow({ item }: { item: ProgramKemiskinan }) {
  return (
    <li className={rows.row}>
      <div className={rows.head}>
        {item.icon ? (
          <span className={rows.icon} aria-hidden>
            <IconMapper name={item.icon} size={32} color="currentColor" />
          </span>
        ) : null}
        <h3 className={rows.title}>
          <Link href={item.href} className={s.titleLink}>
            {item.title}
          </Link>
        </h3>
        <Link href={item.href} className={s.aksi} tabIndex={-1} aria-hidden>
          {PROGRAM_KARTU_TEXT.lihatPenerima}
          <IconChevronRight size={16} stroke={2} />
        </Link>
      </div>
      {item.html ? <div className={rows.prose} dangerouslySetInnerHTML={{ __html: item.html }} /> : null}
    </li>
  );
}
