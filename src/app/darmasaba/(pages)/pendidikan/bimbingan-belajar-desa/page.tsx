import colors from '@/con/colors';
import { Stack, Box, Title, Text, SimpleGrid, Paper, List, ListItem } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Box>
          <Title ta={'center'} order={1} fw={'bold'} c={colors['blue-button']}>
            Bimbingan Belajar Desa
          </Title>
          <Text pb={20} ta={'justify'} fz={'xl'} px={{ base: 'md', md: 100 }}>
          Bimbingan Belajar Desa merupakan program unggulan untuk membantu siswa-siswi di Desa Darmasaba dalam memahami pelajaran sekolah, meningkatkan prestasi akademik, serta membangun semangat belajar yang tinggi sejak dini.
          </Text>
        </Box>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3
          }}
        >
          <Box>
            <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
                Tujuan Program
              </Title>
              <List>
                <ListItem fz={'h4'}>Memberikan pendampingan belajar secara gratis bagi siswa SD hingga SMP</ListItem>
                <ListItem fz={'h4'}>Membantu siswa dalam menghadapi ujian dan menyelesaikan tugas sekolah</ListItem>
                <ListItem fz={'h4'}>Menumbuhkan kepercayaan diri dan kemandirian dalam belajar</ListItem>
                <ListItem fz={'h4'}>Meningkatkan kesetaraan pendidikan untuk seluruh anak desa</ListItem>
              </List>
            </Paper>
          </Box>
          <Box>
            <Paper h={{base: 0, md: 324}} p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
                Lokasi dan Jadwal
              </Title>
              <List>
                <ListItem fz={'h4'}>Lokasi: Balai Banjar / Balai Desa Darmasaba / Perpustakaan Desa</ListItem>
                <ListItem fz={'h4'}>Jadwal: Setiap hari Senin, Rabu, dan Jumat pukul 16.00–18.00 WITA</ListItem>
                <ListItem fz={'h4'}>Peserta: Terbuka untuk semua siswa SD–SMP di wilayah desa</ListItem>
              </List>
            </Paper>
          </Box> 
          <Box>
            <Paper h={{base: 0, md: 324}} p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
              Fasilitas yang Disediakan
              </Title>
              <List>
                <ListItem fz={'h4'}>Buku-buku pelajaran dan alat tulis</ListItem>
                <ListItem fz={'h4'}>Ruang belajar nyaman dan kondusif</ListItem>
                <ListItem fz={'h4'}>Modul latihan dan pendampingan tugas</ListItem>
                <ListItem fz={'h4'}>Minuman ringan dan dukungan motivasi belajar</ListItem>
              </List>
            </Paper>
          </Box> 
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
