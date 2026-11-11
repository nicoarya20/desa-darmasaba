'use client'
import {
  MonevSummary,
  STATUS_PEMBANGUNAN,
  STATUS_PEMBANGUNAN_COLOR,
  STATUS_PEMBANGUNAN_LABEL,
  formatRupiah,
} from '@/lib/kegiatan-pembangunan';
import { Paper, RingProgress, SimpleGrid, Stack, Text } from '@mantine/core';

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Paper withBorder radius="lg" p="md" shadow="sm">
      <Stack gap={2}>
        <Text fz="xs" c="dimmed" fw={600} tt="uppercase">{label}</Text>
        <Text fz={{ base: 'lg', md: 'xl' }} fw={700} c={color} lh={1.3}>{value}</Text>
      </Stack>
    </Paper>
  );
}

/** Kartu ringkasan Monev: jumlah per status, total anggaran, rata-rata progres. */
export default function MonevSummaryCards({ summary }: { summary: MonevSummary }) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="md">
      {STATUS_PEMBANGUNAN.map((status) => (
        <StatCard
          key={status}
          label={`Kegiatan ${STATUS_PEMBANGUNAN_LABEL[status]}`}
          value={String(summary.perStatus[status])}
          color={STATUS_PEMBANGUNAN_COLOR[status]}
        />
      ))}
      <StatCard label="Total Anggaran" value={formatRupiah(summary.totalAnggaran)} />
      <Paper withBorder radius="lg" p="md" shadow="sm">
        <Stack gap={2} align="flex-start">
          <Text fz="xs" c="dimmed" fw={600} tt="uppercase">Rata-rata Progres</Text>
          <RingProgress
            size={72}
            thickness={8}
            roundCaps
            sections={[{ value: summary.rataRataProgres, color: 'blue' }]}
            label={<Text ta="center" fz="xs" fw={700}>{summary.rataRataProgres}%</Text>}
          />
        </Stack>
      </Paper>
    </SimpleGrid>
  );
}
