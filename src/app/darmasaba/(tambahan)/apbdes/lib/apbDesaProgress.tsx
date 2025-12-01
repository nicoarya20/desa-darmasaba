'use client';

import colors from '@/con/colors';
import { Box, Paper, Progress, Stack, Text, Title } from '@mantine/core';
import { APBDesData } from './types';

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
  }).format(value);
}

interface APBDesProgressProps {
  apbdesData: APBDesData;
}

function APBDesProgress({ apbdesData }: APBDesProgressProps) {
  // Return null if apbdesData is not available yet
  if (!apbdesData) {
    return null;
  }

  const items = apbdesData.items || [];
  const sortedItems = [...items].sort((a, b) => a.kode.localeCompare(b.kode));

  // Kelompokkan berdasarkan tipe
  const pendapatanItems = sortedItems.filter(item => item.tipe === 'pendapatan');
  const belanjaItems = sortedItems.filter(item => item.tipe === 'belanja');
  const pembiayaanItems = sortedItems.filter(item => item.tipe === 'pembiayaan');
  
  // Items without a type (should be filtered out from calculations)
  const untypedItems = sortedItems.filter(item => !item.tipe);
  
  if (untypedItems.length > 0) {
    console.warn(`Found ${untypedItems.length} items without a type. These will be excluded from calculations.`);
  }

  // Hitung total per kategori
  const calcTotal = (items: { anggaran: number; realisasi: number }[]) => {
    const anggaran = items.reduce((sum, item) => sum + item.anggaran, 0);
    const realisasi = items.reduce((sum, item) => sum + item.realisasi, 0);
    const persen = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;
    return { anggaran, realisasi, persen };
  };

  const pendapatan = calcTotal(pendapatanItems);
  const belanja = calcTotal(belanjaItems);
  const pembiayaan = calcTotal(pembiayaanItems);

  // Render satu progress bar
  const renderProgress = (label: string, dataset: { realisasi: number; anggaran: number; persen: number }) => {
    const isPembiayaan = label.includes('Pembiayaan');

    return (
      <Box key={label}>
        <Text fw={600} fz="sm">{label}</Text>
        <Text fw={700} mb="xs">
          {formatRupiah(dataset.realisasi)} | {formatRupiah(dataset.anggaran)}
        </Text>
        <Progress
          value={dataset.persen}
          size="xl"
          radius="xl"
          striped={false}
          styles={{
            root: { backgroundColor: '#d7e3f1' },
            section: {
              backgroundColor: isPembiayaan
                ? 'green'
                : colors['blue-button'],
              position: 'relative',
              '&::after': {
                content: `'${dataset.persen.toFixed(2)}%'`,
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.8rem',
              },
            },
          }}
        />
      </Box>
    );
  };

  return (
    <Paper
      mx={{ base: 'md', md: 100 }}
      p="xl"
      radius="md"
      shadow="sm"
      withBorder
      bg={colors['white-1']}
    >
      <Stack gap="lg">
        <Title order={4} c={colors['blue-button']} ta="center">
          Grafik Pelaksanaan APBDes Tahun {apbdesData.tahun}
        </Title>

        <Text ta="center" fw="bold" fz="sm" c="dimmed">
          Realisasi | Anggaran
        </Text>

        {renderProgress('Pendapatan Desa', pendapatan)}
        {renderProgress('Belanja Desa', belanja)}
        {renderProgress('Pembiayaan Desa', pembiayaan)}
      </Stack>
    </Paper>
  );
}

export default APBDesProgress;