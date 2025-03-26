import colors from '@/con/colors';
import { Stack, Box, Text, List, ListItem, Paper, SimpleGrid, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    image: '/api/img/administrasi-digital.png',
    judul: 'Layanan Administrasi Digital',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Sistem pengurusan dokumen kependudukan online.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pembuatan KTP, KK, Surat Keterangan secara daring.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Antrian dan pembayaran pajak berbasis aplikasi mobile.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Sistem informasi kependudukan terintegrasi.</ListItem>
    </List>
  },
  {
    id: 2,
    image: '/api/img/edukasi-digital.png',
    judul: 'Edukasi Digital',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Ruang Belajar Digital dengan akses internet gratis.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pelatihan komputer dan literasi digital untuk semua usia.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Kursus online keterampilan digital (desain, pemrograman, marketing).</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Beasiswa pendidikan teknologi untuk pemuda desa.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Perpustakaan digital dengan koleksi buku elektronik.</ListItem>
    </List>
  },
  {
    id: 3,
    image: '/api/img/ekonomi-digital.png',
    judul: 'Ekonomi Digital',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Marketplace produk UMKM Darmasaba.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Platform pemasaran hasil pertanian dan kerajinan lokal.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Sistem pembayaran digital untuk pelaku usaha desa.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Inkubator bisnis digital untuk wirausaha muda.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pelatihan e-commerce dan digital marketing.</ListItem>
    </List>
  },
  {
    id: 4,
    image: '/api/img/kesehatan-daring.png',
    judul: 'Kesehatan Daring',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Telemedicine dengan dokter dan puskesmas.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Monitoring kesehatan berbasis aplikasi.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pendaftaran antrian puskesmas online.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Edukasi kesehatan melalui platform digital.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Rekam medis elektronik.</ListItem>
    </List>
  },
  {
    id: 5,
    image: '/api/img/pertanian-cerdas.png',
    judul: 'Pertanian Cerdas',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Sistem informasi cuaca dan prediksi pertanian.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Konsultasi pertanian online dengan ahli.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Penjualan hasil pertanian melalui platform digital.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pelatihan pertanian modern berbasis teknologi.</ListItem>
    </List>
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
          Desa Digital / Smart Village
        </Text>
        <Text ta={'center'} fz={'h4'}>Mewujudkan Desa Darmasaba sebagai pusat inovasi digital yang memberdayakan masyarakat, meningkatkan kesejahteraan, dan menciptakan peluang ekonomi berbasis teknologi.</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 3
            }}
          >
            {data.map((v, k) => {
              return (
                <Paper p={'xl'} key={k}>
                  <Image src={v.image} pb={10} radius={10} alt='' />
                  <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.judul}</Text>
                  <Box pr={'lg'}>
                  {v.deskripsi}
                  </Box>
                </Paper>
              )
            })}
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
