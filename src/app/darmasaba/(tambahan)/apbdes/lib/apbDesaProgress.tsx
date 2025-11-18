/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/(dashboard)/landing-page/APBDes/APBDesProgress.tsx
'use client';

import { Box, Paper, Progress, Stack, Text, Title } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
import colors from '@/con/colors';



function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
  }).format(value);
}

function APBDesProgress() {
  const state = useProxy(apbdes);
  const data = state.findMany.data || [];

  // Ambil APBDes pertama (misalnya, jika hanya satu tahun ditampilkan)
  const apbdesItem = data[0]; // 👈 sesuaikan logika jika ada banyak APBDes

  if (!apbdesItem) {
    return (
      <Box py="md" px={{ base: 'md', md: 100 }}>
        <Text c="dimmed">Belum ada data APBDes untuk ditampilkan.</Text>
      </Box>
    );
  }

  const items = apbdesItem.items || [];
  const sortedItems = [...items].sort((a, b) => a.kode.localeCompare(b.kode));

  // Kelompokkan berdasarkan tipe
  const pendapatanItems = sortedItems.filter(item => item.tipe === 'pendapatan');
  const belanjaItems = sortedItems.filter(item => item.tipe === 'belanja');
  const pembiayaanItems = sortedItems.filter(item => item.tipe === 'pembiayaan'); // jika ada

  // Hitung total per kategori
  const calcTotal = (items: any[]) => {
    const anggaran = items.reduce((sum, item) => sum + item.anggaran, 0);
    const realisasi = items.reduce((sum, item) => sum + item.realisasi, 0);
    const persen = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;
    return { anggaran, realisasi, persen };
  };

  const pendapatan = calcTotal(pendapatanItems);
  const belanja = calcTotal(belanjaItems);
  const pembiayaan = calcTotal(pembiayaanItems); // bisa kosong

  // Render satu progress bar
  const renderProgress = (label: string, dataset: any) => {
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
                ? 'green' // warna hijau untuk pembiayaan
                : colors['blue-button'], // biru untuk pendapatan/belanja
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
          Grafik Pelaksanaan APBDes Tahun {apbdesItem.tahun}
        </Title>

        <Text ta="center" fw="bold" fz="sm" c="dimmed">
          Realisasi | Anggaran
        </Text>

        {renderProgress('Pendapatan Desa', pendapatan)}
        {renderProgress('Belanja Desa', belanja)}
        {renderProgress('Pembiayaan Desa', pembiayaan)}
        {pembiayaanItems.length > 0 && renderProgress('Pembiayaan Desa', pembiayaan)}
      </Stack>
    </Paper>
  );
}

export default APBDesProgress;

// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// import { Box, Paper, Stack, Text, Title } from '@mantine/core';
// import { BarChart } from '@mantine/charts';
// import { useProxy } from 'valtio/utils';
// import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
// import colors from '@/con/colors';

// function APBDesProgress() {
//   const state = useProxy(apbdes);
//   const data = state.findMany.data || [];

//   const apbdesItem = data[0];
//   if (!apbdesItem) {
//     return (
//       <Box py="md" px={{ base: 'md', md: 100 }}>
//         <Text c="dimmed">Belum ada data APBDes untuk ditampilkan.</Text>
//       </Box>
//     );
//   }

//   const items = apbdesItem.items || [];
//   const sortedItems = [...items].sort((a, b) => a.kode.localeCompare(b.kode));

//   const pendapatanItems = sortedItems.filter(i => i.tipe === 'pendapatan');
//   const belanjaItems = sortedItems.filter(i => i.tipe === 'belanja');
//   const pembiayaanItems = sortedItems.filter(i => i.tipe === 'pembiayaan');

//   const total = (rows: any[]) => {
//     const anggaran = rows.reduce((s, i) => s + i.anggaran, 0);
//     const realisasi = rows.reduce((s, i) => s + i.realisasi, 0);
//     return anggaran === 0 ? 0 : (realisasi / anggaran) * 100;
//   };

//   const chartData = [
//     { name: 'Pendapatan', persen: total(pendapatanItems) },
//     { name: 'Belanja', persen: total(belanjaItems) },
//   ];

//   if (pembiayaanItems.length > 0) {
//     chartData.push({ name: 'Pembiayaan', persen: total(pembiayaanItems) });
//   }

//   return (
//     <Paper
//       mx={{ base: 'md', md: 100 }}
//       p="xl"
//       radius="md"
//       shadow="sm"
//       withBorder
//       bg={colors['white-1']}
//     >
//       <Stack gap="lg">
//         <Title order={4} c={colors['blue-button']} ta="center">
//           Grafik Pelaksanaan APBDes Tahun {apbdesItem.tahun}
//         </Title>

//         <Text ta="center" fw="bold" fz="sm" c="dimmed">
//           Persentase Realisasi (%) dari Anggaran
//         </Text>

//         <BarChart
//           h={200}
//           data={chartData}
//           orientation="vertical"
//           dataKey="name"
//           barProps={{ radius: 6 }}
//           series={[
//             {
//               name: 'persen',
//               label: 'Persentase',
//               color: colors['blue-button'],
//             },
//           ]}
//           yAxisProps={{
//             domain: [0, 100],
//           }}
//           valueFormatter={(v) => `${v.toFixed(1)}%`}
//         />
//       </Stack>
//     </Paper>
//   );
// }

// export default APBDesProgress;
