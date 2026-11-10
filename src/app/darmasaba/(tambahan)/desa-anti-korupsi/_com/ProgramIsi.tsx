'use client';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { folderGroups, type DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { Stack } from '@mantine/core';
import { useState, type ReactNode } from 'react';
import { resolveActiveFolder, searchDokumen } from '../_lib/program-folder';
import { parseUrut, urutkanItems, type UrutValue } from '../_lib/program-urut';
import { DokumenEmptyState } from './DokumenEmptyState';
import { DokumenPreviewModal } from './DokumenPreviewModal';
import { DokumenRingkasList } from './DokumenRingkasList';
import { DokumenToolbar } from './DokumenToolbar';
import { FolderAktif } from './FolderAktif';
import { FolderGrid } from './FolderGrid';
import { ProgramHeader } from './ProgramHeader';

type Props = {
  detail: DesaAntiKorupsiDetail;
  /** Isi query `?folder=` (id folder / "umum"). */
  folderParam: string | null;
  /** Isi query `?urut=` (nilai asing → urutan asli). */
  urutParam: string | null;
  /** Dipanggil saat pilihan "Urutkan" berubah; halaman menulisnya ke URL. */
  onUrutChange: (urut: UrutValue) => void;
};

/** Isi halaman program publik: header + unduh ZIP, cari & urutkan dokumen, grid folder atau isi folder aktif. */
export function ProgramIsi({ detail, folderParam, urutParam, onUrutChange }: Props) {
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<DokumenDesaAntiKorupsiView | null>(null);
  const groups = folderGroups(detail);
  const active = resolveActiveFolder(folderParam, groups);
  const urut = parseUrut(urutParam);
  const searching = query.trim() !== '';
  const jumlahDokumen = groups.reduce((n, g) => n + g.dokumen.length, 0);

  let content: ReactNode;
  if (groups.length === 0) {
    content = <DokumenEmptyState>Belum ada dokumen pada program ini</DokumenEmptyState>;
  } else if (searching) {
    const hasil = urutkanItems(searchDokumen(groups, query), (h) => h.dokumen, urut);
    content =
      hasil.length === 0 ? (
        <DokumenEmptyState>Dokumen dengan judul &quot;{query.trim()}&quot; tidak ditemukan</DokumenEmptyState>
      ) : (
        <DokumenRingkasList
          items={hasil.map((h) => ({ dokumen: h.dokumen, folderLabel: h.folder.nama }))}
          onPreview={setPreview}
        />
      );
  } else if (active) {
    content = <FolderAktif programId={detail.id} folder={active} groups={groups} urut={urut} onPreview={setPreview} />;
  } else {
    content = <FolderGrid programId={detail.id} groups={groups} urut={urut} />;
  }

  return (
    <Stack gap="lg">
      <ProgramHeader detail={detail} folderName={searching ? null : (active?.nama ?? null)} jumlahDokumen={jumlahDokumen} />
      {groups.length > 0 && (
        <DokumenToolbar
          query={query}
          onQueryChange={setQuery}
          urut={urut}
          onUrutChange={onUrutChange}
          showUrut={searching || active !== null}
        />
      )}
      {content}
      <DokumenPreviewModal dokumen={preview} onClose={() => setPreview(null)} />
    </Stack>
  );
}
