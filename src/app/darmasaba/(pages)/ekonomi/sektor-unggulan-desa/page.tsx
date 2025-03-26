import colors from '@/con/colors';
import { Stack, Box, Text, Paper } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { BarChart } from '@mantine/charts';

const data = [
  {
    id: 1,
    sektor: 'Sektor Pertanian',
    Ton: 20
  },
  {
    id: 2,
    sektor: 'Sektor Peternakan',
    Ton: 5
  },

]
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Sektor Unggulan Desa Darmasaba
        </Text>
        <Text ta={'center'} fz={'h4'}> Desa Darmasaba dikenal sebagai desa dengan potensi unggulan di sektor pertanian dan peternakan</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <Paper p={'xl'}>
            <Text fw={'bold'} fz={'h4'}>Jumlah Penduduk Miskin Per Tahun</Text>
            <Text fz={'h4'} ta={'justify'}>
              Pertanian di Darmasaba berfokus pada padi, sayuran, dan hortikultura yang dikembangkan dengan metode pertanian
              organik serta sistem irigasi tradisional yang efisien. Keberlanjutan dalam pertanian juga didukung dengan pemanfaatan
              teknologi modern untuk meningkatkan produktivitas hasil panen.
            </Text>
          </Paper>
          <Paper p={'xl'}>
            <Text fw={'bold'} fz={'h4'}>Sektor Peternakan</Text>
            <Text fz={'h4'} ta={'justify'}>
              Di bidang peternakan, Desa Darmasaba memiliki potensi besar dalam pengembangan sapi, ayam, dan babi. Sistem
              peternakan yang diterapkan mengutamakan pengelolaan pakan alami dan perawatan hewan yang sehat, sehingga
              menghasilkan produk ternak berkualitas tinggi.
            </Text>
          </Paper>
          <Paper p={'xl'}>
            <Text pb={10} fw={'bold'} fz={'h4'}>Statistik Sektor Unggulan Darmasaba</Text>
            <BarChart
              p={10}
              h={300}
              data={data}
              dataKey="sektor"
              series={[
                { name: 'Ton', color: colors['blue-button'] },
              ]}
              tickLine="y"
            />
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
