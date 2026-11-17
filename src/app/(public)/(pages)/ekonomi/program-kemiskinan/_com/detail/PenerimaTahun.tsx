'use client';
import { Stack } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';
import { loadPenerimaPublik, loadRekapPublik } from '../program-kemiskinan.source';
import { useMuat } from '../use-muat';
import { DaftarPenerimaView } from './DaftarPenerimaView';
import { MuatStatus } from './MuatStatus';
import { RekapAlamatView } from './RekapAlamatView';

/** Rekap per alamat + daftar penerima satu tahun; dipasang ulang (key) setiap tahun diganti. */
export function PenerimaTahun({ programKey, tahun }: { programKey: string; tahun: number }) {
  const [cari, setCari] = useState('');
  const [search] = useDebouncedValue(cari.trim(), 400);
  const [halaman, setHalaman] = useState({ search: '', page: 1 });
  // Halaman kembali ke 1 setiap kata kunci berubah (diturunkan, bukan efek).
  const page = halaman.search === search ? halaman.page : 1;

  const rekap = useMuat(`${programKey}|${tahun}`, () => loadRekapPublik(programKey, tahun), 'rekap penerima');
  const daftar = useMuat(
    `${programKey}|${tahun}|${page}|${search}`,
    () => loadPenerimaPublik(programKey, { tahun, page, search }),
    'daftar penerima',
  );

  return (
    <Stack gap="xl">
      {rekap.state.status === 'ready' ? (
        rekap.state.data.data.length > 0 && <RekapAlamatView rekap={rekap.state.data} />
      ) : (
        <MuatStatus status={rekap.state.status} onRetry={rekap.retry} />
      )}
      <DaftarPenerimaView
        state={daftar.state}
        cari={cari}
        onCari={setCari}
        onHalaman={(p) => setHalaman({ search, page: p })}
        onRetry={daftar.retry}
      />
    </Stack>
  );
}
