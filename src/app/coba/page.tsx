import colors from '@/con/colors';
import { Box, Center, Image, List, ListItem, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../darmasaba/(pages)/desa/layanan/_com/BackButto';


const data1 = [
  {
    id: 1,
    judul: 'Peran Pecalang dalam Keamanan Desa',
    image: '/api/img/pecalang.png',
    pengertian: 'Pecalang adalah petugas keamanan adat di Bali yang memiliki peran penting dalam menjaga ketertiban dan budaya lokal. Tugas mereka meliputi:',
    deskripsi: <List>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Mengamankan upacara adat dan kegiatan keagamaan.</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Mengatur lalu lintas saat ada perayaan atau kegiatan besar.</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Berpatroli untuk mencegah gangguan keamanan di lingkungan desa.</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Berkoordinasi dengan aparat desa dan kepolisian dalam penanganan situasi darurat.</ListItem>
    </List>
  },
  {
    id: 2,
    judul: 'Patwal (Patroli Pengawal) Desa',
    image: '/api/img/patwal-1.png',
    pengertian: 'Selain Pecalang, Desa Darmasaba juga memiliki Patwal yang bertugas menjaga keamanan sehari-hari. Peran mereka antara lain:',
    deskripsi: <List>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Berpatroli secara rutin untuk memastikan lingkungan tetap aman.</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Menjaga ketertiban lalu lintas di area desa.</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Melakukan tindakan preventif terhadap potensi gangguan keamanan.</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Siap siaga dalam keadaan darurat untuk membantu warga.</ListItem>
    </List>
  },
  {
    id: 3,
    judul: 'Layanan Keamanan yang Tersedia',
    image: '/api/img/pospecalang.png',
    pengertian: 'Jika terjadi keadaan darurat atau membutuhkan bantuan keamanan, warga dapat menghubungi:',
    deskripsi: <List>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Pos Pecalang Desa: [Masukkan Nomor Kontak].</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Patwal Desa Darmasaba: [Masukkan Nomor Kontak].</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Polsek Terdekat: 110 (Layanan Kepolisian).</ListItem>
    </List>
  },
  {
    id: 4,
    judul: 'Program Keamanan Desa',
    image: '/api/img/rond.png',
    pengertian: 'Untuk meningkatkan keamanan, Desa Darmasaba menjalankan berbagai program, seperti:',
    deskripsi: <List>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Ronda Malam Warga: Kegiatan jaga malam secara bergilir oleh warga bersama Pecalang dan Patwal.</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}>Sosialisasi Keamanan: Edukasi bagi warga tentang cara menjaga keamanan lingkungan.</ListItem>
      <ListItem fz={{ base: 'h4', md: 'lg' }}> Pengawasan Kamera CCTV: Memantau titik- titik strategis untuk mencegah tindak kejahatan.</ListItem>
    </List>
  }
]

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Keamanan Lingkungan (Pecalang / Patwal)
        </Text>
        <Text px={{ base: 20, md: 150 }} ta={"center"} fz={{ base: "h4", md: "h3" }} >
          Keamanan dan ketertiban lingkungan di Desa Darmasaba dijaga melalui peran aktif Pecalang dan Patwal (Patroli Pengawal). Mereka bertugas memastikan desa tetap aman, tertib, dan kondusif bagi seluruh warga.
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 3,
            }}>
            {data1.map((v, k) => {
              return (
                <Paper radius={10} key={k} bg={colors["white-trans-1"]}>
                  <Stack gap={'xs'}>
                    <Center px={10} py={20}>
                      <Image src={v.image} alt='' />
                    </Center>
                    <Box px={'lg'}>
                      <Box pb={20}>
                        <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                          {v.judul}
                        </Text>
                        <Text pb={10} fz={"h4"} ta={'justify'}>
                          {v.pengertian}
                        </Text>
                        <Box px={10}>
                          {v.deskripsi}
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
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
