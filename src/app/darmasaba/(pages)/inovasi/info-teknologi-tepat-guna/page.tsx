import colors from '@/con/colors';
import { Stack, Box, Text, List, ListItem, Paper, SimpleGrid, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    image: '/api/img/pertanian-cerdas.png',
    judul: 'Pertanian Cerdas',
    subjudul1: 'Sistem Irigasi Hemat Air',
    subjudul2: 'Pengolahan Limbah Pertanian',
    deskripsi1: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Penggunaan sensor kelembaban tanah</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Kontrol penyiraman otomatis </ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pengurangan konsumsi air hingga 40%</ListItem>
    </List>,
    deskripsi2: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mesin pencacah jerami otomatis</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Konversi limbah menjadi pupuk organik</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mengurangi pembakaran sampah pertanian</ListItem>
    </List>,
  },
  {
    id: 2,
    image: '/api/img/energi-terbarukan.png',
    judul: 'Energi Terbarukan',
    subjudul1: 'Pembangkit Listrik Mikrohidro',
    subjudul2: 'Solar Home System',
    deskripsi1: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Memanfaatkan aliran sungai sekitar</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Kapasitas 10-50 kW</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Elektrifikasi mandiri desa</ListItem>
    </List>,
    deskripsi2: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Panel surya untuk rumah tangga </ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Akses listrik 24 jam</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Hemat biaya energi</ListItem>
    </List>,
  },
  {
    id: 3,
    image: '/api/img/pengolahan-pangan.png',
    judul: 'Pengolahan Pangan',
    subjudul1: 'Mesin Pengering Hasil Pertanian',
    subjudul2: 'Alat Pengolah Hasil Pertanian',
    deskripsi1: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Teknologi pengering tenaga surya</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Menjaga kualitas hasil panen</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mencegah kerusakan pasca panen</ListItem>
    </List>,
    deskripsi2: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mesin pengupas dan pengemas produk</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Meningkatkan nilai jual komoditas</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Standarisasi kualitas produk</ListItem>
    </List>,
  },
  {
    id: 4,
    image: '/api/img/pengelolaan-sampah.png',
    judul: 'Pengelolaan Sampah',
    subjudul1: 'Sistem Pengolahan Sampah Terpadu',
    subjudul2: 'Komposter Komunal',
    deskripsi1: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pemilahan otomatis</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Daur ulang sampah organik dan anorganik</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pembangkit listrik dari sampah</ListItem>
    </List>,
    deskripsi2: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Teknologi pengomposan cepat</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Menghasilkan pupuk organik</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mengurangi sampah ke TPA</ListItem>
    </List>,
  },
  {
    id: 5,
    image: '/api/img/kesehatan-daring.png',
    judul: 'Kesehatan Masyarakat',
    subjudul1: 'Alat Deteksi Dini Penyakit',
    subjudul2: 'Air Bersih Mandiri',
    deskripsi1: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Skrining kesehatan portable </ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pemeriksaan tekanan darah dan gula </ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Konsultasi medis jarak jauh</ListItem>
    </List>,
    deskripsi2: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Sistem filter air canggih </ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Menghilangkan kontaminan </ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Jaminan kualitas air minum

</ListItem>
    </List>,
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
          Info Teknologi Tepat Guna
        </Text>
        <Text ta={'center'} fz={'h4'}>Desa Darmasaba berkomitmen mengembangkan teknologi tepat guna yang sesuai dengan kebutuhan masyarakat, mendukung pembangunan berkelanjutan, dan meningkatkan kualitas hidup warga.</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} p={'lg'}>
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
                  <Box pr={'lg'} pb={10}>
                  <Text fz={'h4'} fw={'bold'} >{v.subjudul1}</Text>
                    {v.deskripsi1}
                  </Box>
                  <Box pr={'lg'}>
                  <Text fz={'h4'} fw={'bold'} >{v.subjudul2}</Text>
                    {v.deskripsi2}
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
