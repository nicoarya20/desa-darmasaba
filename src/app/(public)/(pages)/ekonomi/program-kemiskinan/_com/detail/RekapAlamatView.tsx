import { Group, Progress, Stack, Text, Title } from '@mantine/core';
import { PROGRAM_DETAIL_TEXT as T } from '../program-kemiskinan.text';
import type { RekapPublik } from '../program-kemiskinan.types';

/** Rekap jumlah penerima per alamat/banjar (bar horizontal), sisa di luar batas digabung "Lainnya". */
export function RekapAlamatView({ rekap }: { rekap: RekapPublik }) {
  const baris = rekap.lainnya > 0 ? [...rekap.data, { alamat: T.lainnya, jumlah: rekap.lainnya }] : rekap.data;
  const maks = Math.max(1, ...baris.map((b) => b.jumlah));
  return (
    <Stack gap="xs">
      <Title order={3} fz="lg" c="var(--c-brand)">
        {T.rekapJudul}
      </Title>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {baris.map((b) => (
          <li key={b.alamat}>
            <Group justify="space-between" gap="xs" wrap="nowrap">
              <Text fz="sm">{b.alamat}</Text>
              <Text fz="sm" fw={600}>
                {T.orang(b.jumlah)}
              </Text>
            </Group>
            <Progress value={(b.jumlah / maks) * 100} size="sm" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </Stack>
  );
}
