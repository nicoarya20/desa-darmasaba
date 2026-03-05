/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Title, Progress, Stack, Text, Group, Box } from '@mantine/core';

function Summary({ title, data }: any) {
  if (!data || data.length === 0) return null;

  const totalAnggaran = data.reduce((s: number, i: any) => s + i.anggaran, 0);
  // Use realisasi field (already mapped from totalRealisasi in transformAPBDesData)
  const totalRealisasi = data.reduce((s: number, i: any) => s + (i.realisasi || i.totalRealisasi || 0), 0);

  const persen =
    totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  // Format angka ke dalam format Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  // Tentukan warna berdasarkan persentase
  const getProgressColor = (persen: number) => {
    if (persen >= 100) return 'teal';
    if (persen >= 80) return 'blue';
    if (persen >= 60) return 'yellow';
    return 'red';
  };

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text fw={600} fz="md">{title}</Text>
        <Text fw={700} fz="lg" c={getProgressColor(persen)}>
          {persen.toFixed(2)}%
        </Text>
      </Group>

      <Text fz="sm" c="dimmed" mb="xs">
        Realisasi: {formatRupiah(totalRealisasi)} / Anggaran: {formatRupiah(totalAnggaran)}
      </Text>

      <Progress
        value={persen}
        size="xl"
        radius="xl"
        color={getProgressColor(persen)}
        striped={persen < 100}
        animated={persen < 100}
      />

      {persen >= 100 && (
        <Text fz="xs" c="teal" mt="xs" fw={500}>
          ✓ Realisasi mencapai 100% dari anggaran
        </Text>
      )}

      {persen < 100 && persen >= 80 && (
        <Text fz="xs" c="blue" mt="xs" fw={500}>
          ⚡ Realisasi baik, mendekati target
        </Text>
      )}

      {persen < 80 && persen >= 60 && (
        <Text fz="xs" c="yellow" mt="xs" fw={500}>
          ⚠️ Realisasi cukup, perlu ditingkatkan
        </Text>
      )}

      {persen < 60 && (
        <Text fz="xs" c="red" mt="xs" fw={500}>
          ⚠️ Realisasi rendah, perlu perhatian khusus
        </Text>
      )}
    </Box>
  );
}

export default function GrafikRealisasi({ apbdesData }: any) {
  const items = apbdesData.items || [];
  const tahun = apbdesData.tahun || new Date().getFullYear();

  const pendapatan = items.filter((i: any) => i.tipe === 'pendapatan');
  const belanja = items.filter((i: any) => i.tipe === 'belanja');
  const pembiayaan = items.filter((i: any) => i.tipe === 'pembiayaan');

  // Hitung total keseluruhan
  const totalAnggaranSemua = items.reduce((s: number, i: any) => s + i.anggaran, 0);
  // Use realisasi field (already mapped from totalRealisasi in transformAPBDesData)
  const totalRealisasiSemua = items.reduce((s: number, i: any) => s + (i.realisasi || i.totalRealisasi || 0), 0);
  const persenSemua = totalAnggaranSemua > 0 ? (totalRealisasiSemua / totalAnggaranSemua) * 100 : 0;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={5} mb="md">
        GRAFIK REALISASI APBDes {tahun}
      </Title>

      <Stack gap="lg" mb="lg">
        <Summary title="💰 Pendapatan" data={pendapatan} />
        <Summary title="💸 Belanja" data={belanja} />
        <Summary title="📊 Pembiayaan" data={pembiayaan} />
      </Stack>

      {/* Summary Total Keseluruhan
      <Box p="md" bg="gray.0">
        <>
          <Group justify="space-between" mb="xs">
            <Text fw={700} fz="lg">TOTAL KESELURUHAN</Text>
            <Text fw={700} fz="xl" c={persenSemua >= 100 ? 'teal' : persenSemua >= 80 ? 'blue' : 'red'}>
              {persenSemua.toFixed(2)}%
            </Text>
          </Group>
          <Text fz="sm" c="dimmed" mb="xs">
            {formatRupiah(totalRealisasiSemua)} / {formatRupiah(totalAnggaranSemua)}
          </Text>
          <Progress
            value={persenSemua}
            size="lg"
            radius="xl"
            color={persenSemua >= 100 ? 'teal' : persenSemua >= 80 ? 'blue' : 'red'}
          />
        </>
      </Box> */}
    </Paper>
  );
}