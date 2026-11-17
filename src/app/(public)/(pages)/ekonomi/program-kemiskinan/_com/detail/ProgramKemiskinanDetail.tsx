'use client';
import colors from '@/con/colors';
import { Box, Stack } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useState } from 'react';
import { loadProgramPublik } from '../program-kemiskinan.source';
import { PROGRAM_DETAIL_TEXT as T } from '../program-kemiskinan.text';
import { useMuat } from '../use-muat';
import { MuatStatus } from './MuatStatus';
import { ProgramDetailBody } from './ProgramDetailBody';

/** Halaman detail program (`/ekonomi/program-kemiskinan/{slug}`): muat program lalu tampilkan isi/status. */
export function ProgramKemiskinanDetail({ programKey }: { programKey: string }) {
  const { state, retry } = useMuat(programKey, () => loadProgramPublik(programKey), 'program kemiskinan');
  const [tahun, setTahun] = useState<number | null>(null);

  return (
    <Stack bg={colors.Bg} py="xl" px={{ base: 'md', md: 100 }} gap="lg" aria-busy={state.status === 'loading' || undefined}>
      <Box>
        <Link
          href="/ekonomi/program-kemiskinan"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: colors['blue-button'] }}
        >
          <IconChevronLeft size={16} aria-hidden="true" />
          {T.kembali}
        </Link>
      </Box>
      {state.status === 'ready' ? (
        <ProgramDetailBody program={state.data} tahun={tahun} onPilihTahun={setTahun} />
      ) : (
        <MuatStatus status={state.status} onRetry={retry} tinggi={400} />
      )}
    </Stack>
  );
}
