'use client';
import { IconKey, IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';
import colors from '@/con/colors';
import { sanitizeRichText } from '@/lib/rich-text';
import { Box, Group, Paper, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { PROGRAM_DETAIL_TEXT as T } from '../program-kemiskinan.text';
import type { ProgramPublik } from '../program-kemiskinan.types';
import { PenerimaTahun } from './PenerimaTahun';

type Props = { program: ProgramPublik; tahun: number | null; onPilihTahun: (tahun: number) => void };

/**
 * Isi detail program: judul, deskripsi, lalu bagian penerima — pilihan tahun + jumlah, rekap per
 * alamat, dan daftar nama + alamat. Tanpa data penerima → keadaan kosong.
 */
export function ProgramDetailBody({ program, tahun, onPilihTahun }: Props) {
  const deskripsi = sanitizeRichText(program.deskripsi);
  const terpilih = program.tahun.find((t) => t.tahun === tahun) ?? program.tahun[0] ?? null;

  return (
    <Stack gap="lg">
      <Group gap="sm" wrap="nowrap" align="center">
        {program.icon && <IconMapper name={program.icon as IconKey} size={36} color={colors['blue-button']} />}
        <Title order={1} c={colors['blue-button']} fz={{ base: 26, md: 34 }}>
          {program.nama}
        </Title>
      </Group>
      {deskripsi && <Box fz={{ base: 'sm', md: 'md' }} lh={1.6} dangerouslySetInnerHTML={{ __html: deskripsi }} />}

      <Paper p={{ base: 'md', md: 'xl' }} radius="md">
        <Stack gap="md">
          <Title order={2} fz="xl" c={colors['blue-button']}>
            {T.penerimaJudul}
          </Title>
          <Text fz="sm" c="dimmed">
            {T.privasi}
          </Text>
          {terpilih === null ? (
            <Stack gap={4} py="md" align="center" ta="center">
              <Text fw={700}>{T.kosongJudul}</Text>
              <Text fz="sm" c="dimmed">
                {T.kosongDesc}
              </Text>
            </Stack>
          ) : (
            <>
              <SegmentedControl
                aria-label={T.pilihTahun}
                value={String(terpilih.tahun)}
                onChange={(v) => onPilihTahun(Number(v))}
                data={program.tahun.map((t) => ({ value: String(t.tahun), label: String(t.tahun) }))}
                w="fit-content"
              />
              <Text fw={700} fz="lg">
                {T.jumlahPenerima(terpilih.tahun, terpilih.jumlah)}
              </Text>
              <PenerimaTahun key={terpilih.tahun} programKey={program.slug || program.id} tahun={terpilih.tahun} />
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
