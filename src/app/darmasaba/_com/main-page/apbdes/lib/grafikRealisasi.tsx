/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Title, Progress, Stack, Text } from '@mantine/core';

function Summary({ title, data }: any) {
  if (!data || data.length === 0) return null;

  const totalAnggaran = data.reduce((s: number, i: any) => s + i.anggaran, 0);
  const totalRealisasi = data.reduce((s: number, i: any) => s + i.realisasi, 0);

  const persen =
    totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  return (
    <Stack>
      <Text fw={600}>{title}</Text>
      <Text>
        Rp {totalRealisasi.toLocaleString('id-ID')} /
        Rp {totalAnggaran.toLocaleString('id-ID')}
      </Text>
      <Progress value={persen} size="lg" radius="xl" />
    </Stack>
  );
}

export default function GrafikRealisasi({ apbdesData }: any) {
  const items = apbdesData.items || [];
  const tahun = apbdesData.tahun || new Date().getFullYear();

  const pendapatan = items.filter((i: any) => i.tipe === 'pendapatan');
  const belanja = items.filter((i: any) => i.tipe === 'belanja');
  const pembiayaan = items.filter((i: any) => i.tipe === 'pembiayaan');

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={5} mb="md">
        GRAFIK REALISASI APBDes {tahun}
      </Title>

      <Stack>
        <Summary title="Pendapatan" data={pendapatan} />
        <Summary title="Belanja" data={belanja} />
        <Summary title="Pembiayaan" data={pembiayaan} />
      </Stack>
    </Paper>
  );
}