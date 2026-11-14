'use client'
import colors from '@/con/colors';
import dinamikaPenduduk from '@/app/admin/(dashboard)/_state/kependudukan/dinamika-penduduk';
import { DINAMIKA_FIELDS, formatSelisih, ringkasanDinamika, type DinamikaRow } from '@/lib/dinamika-penduduk';
import { Box, Center, Paper, SimpleGrid, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDatabaseOff } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

const CARD_COLOR: Record<(typeof DINAMIKA_FIELDS)[number]['key'], string> = {
  kelahiran: '#6EDF9C',
  kematian: '#EE5050',
  masuk: '#5082EE',
  keluar: '#FF9F43',
};
const fmt = (n: number) => n.toLocaleString('id-ID');

function Header() {
  return (
    <>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Title order={1} ta="center" c={colors['blue-button']} fw="bold" lh={1.2}>
          Dinamika Penduduk
        </Title>
        <Text ta="center" fz={{ base: 'sm', md: 'md' }} lh={1.5} c="black">
          Statistik kelahiran, kematian, dan perpindahan penduduk per tahun
        </Text>
      </Box>
    </>
  );
}

function Ringkasan({ row }: { row: DinamikaRow }) {
  const { pertumbuhanAlami, migrasiBersih } = ringkasanDinamika(row);
  const items = [
    { label: 'Pertumbuhan Alami', rumus: '(Kelahiran - Kematian)', nilai: pertumbuhanAlami, warna: pertumbuhanAlami >= 0 ? '#2F9E62' : '#EE5050' },
    { label: 'Migrasi Bersih', rumus: '(Pindah Masuk - Pindah Keluar)', nilai: migrasiBersih, warna: migrasiBersih >= 0 ? colors['blue-button'] : '#D9480F' },
  ];
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {items.map((it) => (
        <Paper key={it.label} p="md" bg={colors.grey[1]}>
          <Text fz="sm" c="dimmed">{it.label}</Text>
          <Text fz={24} fw={700} c={it.warna}>{formatSelisih(it.nilai)}</Text>
          <Text fz="xs" c="dimmed">{it.rumus}</Text>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

function TabelPerTahun({ rows }: { rows: DinamikaRow[] }) {
  return (
    <Table.ScrollContainer minWidth={640}>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tahun</Table.Th>
            {DINAMIKA_FIELDS.map((f) => (
              <Table.Th key={f.key} ta="right">{f.label}</Table.Th>
            ))}
            <Table.Th ta="right">Pertumbuhan Alami</Table.Th>
            <Table.Th ta="right">Migrasi Bersih</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => {
            const { pertumbuhanAlami, migrasiBersih } = ringkasanDinamika(row);
            return (
              <Table.Tr key={row.id}>
                <Table.Td fw={600}>{row.tahun}</Table.Td>
                {DINAMIKA_FIELDS.map((f) => (
                  <Table.Td key={f.key} ta="right">{fmt(row[f.key])}</Table.Td>
                ))}
                <Table.Td ta="right">{formatSelisih(pertumbuhanAlami)}</Table.Td>
                <Table.Td ta="right">{formatSelisih(migrasiBersih)}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function Page() {
  const state = useProxy(dinamikaPenduduk);

  useShallowEffect(() => {
    dinamikaPenduduk.findMany.load(1);
  }, []);

  const { data, loading } = state.findMany;

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    );
  }

  const rows = data as DinamikaRow[];
  const terbaru = rows[0];

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Header />

      <Box px={{ base: 'md', md: 100 }}>
        {!terbaru ? (
          <Paper p="xl" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconDatabaseOff size={80} color={colors.grey['2']} />
                <Text ta="center" fz="lg" fw={500} c="dimmed">Data Belum Tersedia</Text>
                <Text ta="center" fz="sm" c="dimmed" maw={400}>
                  Data dinamika penduduk belum diisi. Silakan hubungi administrator desa untuk informasi lebih lanjut.
                </Text>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack gap="lg">
            <Paper p="xl" withBorder>
              <Title order={3} mb="md" c={colors['blue-button']}>
                Statistik Dinamika Penduduk Tahun {terbaru.tahun}
              </Title>
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                {DINAMIKA_FIELDS.map((f) => (
                  <Paper key={f.key} p="lg" bg={CARD_COLOR[f.key]}>
                    <Text fz="sm" c="white" fw={500}>{f.label}</Text>
                    <Text fz={36} fw={700} c="white" mt={10}>{fmt(terbaru[f.key])}</Text>
                  </Paper>
                ))}
              </SimpleGrid>
              <Box mt="xl" pt="xl" style={{ borderTop: `1px solid ${colors.grey['2']}` }}>
                <Text fz="md" c="dimmed" fw={500} mb="md">Ringkasan:</Text>
                <Ringkasan row={terbaru} />
              </Box>
            </Paper>

            {rows.length > 1 && (
              <Paper p="xl" withBorder>
                <Title order={3} mb="md" c={colors['blue-button']}>Perbandingan per Tahun</Title>
                <TabelPerTahun rows={rows} />
              </Paper>
            )}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

export default Page;
