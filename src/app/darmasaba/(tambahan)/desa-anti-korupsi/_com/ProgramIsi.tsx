'use client';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { folderGroups, type DesaAntiKorupsiDetail } from '@/lib/desa-anti-korupsi-view';
import { Text } from '@mantine/core';
import { useState, type ReactNode } from 'react';
import { folderTunggalBerisi, resolveActiveFolder, searchDokumen, tujuanKembali } from '../_lib/program-folder';
import { parseUrut, urutkanItems, type UrutValue } from '../_lib/program-urut';
import { ZIP_HINT } from '../_lib/program-zip';
import { DokumenEmptyState } from './DokumenEmptyState';
import { DokumenPreviewModal } from './DokumenPreviewModal';
import { DokumenRingkasList } from './DokumenRingkasList';
import { DokumenToolbar } from './DokumenToolbar';
import { FolderAktif } from './FolderAktif';
import { FolderList } from './FolderList';
import { ProgramHeader } from './ProgramHeader';
import classes from './program-folder.module.css';
import { UnduhZipButton } from './UnduhZipButton';

type Props = {
  detail: DesaAntiKorupsiDetail;
  /** Isi query `?folder=` (id folder / "umum"). */
  folderParam: string | null;
  /** Isi query `?urut=` (nilai asing → urutan asli). */
  urutParam: string | null;
  /** Dipanggil saat pilihan "Urutkan" berubah; halaman menulisnya ke URL. */
  onUrutChange: (urut: UrutValue) => void;
};

/**
 * Isi halaman program publik: kepala, cari/urut + unduh ZIP, lalu daftar folder atau isi folder.
 * Tanpa `?folder=` dan hanya satu folder berisi dokumen → folder itu langsung dibuka (tanpa langkah pilih folder).
 */
export function ProgramIsi({ detail, folderParam, urutParam, onUrutChange }: Props) {
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<DokumenDesaAntiKorupsiView | null>(null);
  const groups = folderGroups(detail);
  const dipilih = resolveActiveFolder(folderParam, groups);
  const active = dipilih ?? (folderParam ? null : folderTunggalBerisi(groups));
  const urut = parseUrut(urutParam);
  const searching = query.trim() !== '';
  const jumlahDokumen = groups.reduce((n, g) => n + g.dokumen.length, 0);
  const kembali = tujuanKembali({
    programId: detail.id,
    kategori: detail.kategori?.name ?? null,
    folderDibuka: dipilih !== null,
    urut,
  });

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
    content = (
      <FolderAktif
        programId={detail.id}
        folder={active}
        groups={groups}
        urut={urut}
        backHref={kembali.href}
        onPreview={setPreview}
      />
    );
  } else {
    content = <FolderList programId={detail.id} groups={groups} urut={urut} />;
  }

  return (
    <>
      <ProgramHeader detail={detail} folderName={searching ? null : (dipilih?.nama ?? null)} kembali={kembali} />
      {groups.length > 0 && (
        <div className={classes.toolbar}>
          <DokumenToolbar
            query={query}
            onQueryChange={setQuery}
            urut={urut}
            onUrutChange={onUrutChange}
            showUrut={searching || active !== null}
          />
          <div className={classes.zip}>
            <UnduhZipButton programId={detail.id} folder={null} label="Unduh semua (ZIP)" disabled={jumlahDokumen === 0} />
            <Text fz="xs" c="dimmed" data-testid="zip-hint">
              {ZIP_HINT}
            </Text>
          </div>
        </div>
      )}
      {content}
      <DokumenPreviewModal dokumen={preview} onClose={() => setPreview(null)} />
    </>
  );
}
