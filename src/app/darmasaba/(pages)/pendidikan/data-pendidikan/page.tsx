import colors from '@/con/colors';
import { Stack, Box, Title, Paper } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { BarChart } from '@mantine/charts';

const data = [
  {
    kategori: 'Jumlah penduduk usia 15-64 th yang tidak bisa baca tulis',
    jumlah: 30
  },
  {
    kategori: 'Jumlah penduduk tidak tamat SD/sederajat',
    jumlah: 25
  },
  {
    kategori: 'Jumlah penduduk tidak tamat SLTP/Sederajat',
    jumlah: 20
  },
  {
    kategori: 'Jumlah penduduk tidak tamat SLTA/Sederajat',
    jumlah: 10
  },
  {
    kategori: 'Jumlah penduduk tamat Sarjana/S1',
    jumlah: 15
  },
  {
    kategori: 'Jumlah penduduk tamat Pascsarjana',
    jumlah: 30
  },

]
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Box pb={20}>
          <Title ta={'center'} order={1} fw={'bold'} c={colors['blue-button']}>
            Data Pendidikan
          </Title>
        </Box>
        <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
          <BarChart
            p={'100'}
            h={600}
            data={data}
            dataKey="kategori"
            series={[
              { name: 'jumlah', color: colors['blue-button'] },
            ]}
            tickLine="y"
              xAxisProps={{
                angle: -45,  // Rotate labels by -45 degrees
                textAnchor: 'end',  // Anchor text to the end for better alignment
                height: 100,  // Increase height for rotated labels
                interval: 0,  // Show all labels
                style: { 
                  fontSize: '12px',  // Adjust font size if needed
                  overflow: 'visible',
                  whiteSpace: 'nowrap'
                }
              }}
          />
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
