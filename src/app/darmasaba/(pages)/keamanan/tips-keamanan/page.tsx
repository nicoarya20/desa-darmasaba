import colors from '@/con/colors';
import { Box, Center, Image, List, ListItem, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';

const data1 = [
  {
    id: 1,
    judul: 'Keamanan Rumah',
    image: '/api/img/kemanan.png',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pastikan pintu dan jendela selalu terkunci saat meninggalkan rumah.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pasang lampu penerangan di halaman dan area sekitar rumah untuk mencegah tindak kejahatan.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Jangan mudah memberikan akses masuk ke orang yang tidak dikenal.</ListItem>
    </List>
  },
  {
    id: 2,
    judul: 'Keamanan di Jalan',
    image: '/api/img/keamananjalan.png',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Hindari berjalan sendirian di tempat sepi, terutama pada malam hari.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Simpan barang berharga di tempat yang aman saat bepergian.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Gunakan jalur yang ramai dan terang saat pulang malam.</ListItem>
    </List>
  },
  {
    id: 3,
    judul: 'Keamanan Kendaraan',
    image: '/api/img/keamanankendaraan.png',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Gunakan kunci ganda saat memarkir kendaraan, terutama di tempat umum.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Parkir di tempat yang terang dan mudah diawasi.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Jangan meninggalkan barang berharga di dalam kendaraan.</ListItem>
    </List>
  },
  {
    id: 4,
    judul: 'Keamanan Sosial',
    image: '/api/img/mencurigakan.png',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Laporkan kejadian mencurigakan kepada Pecalang atau perangkat desa.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Jangan mudah percaya terhadap informasi yang belum jelas sumbernya.</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Ikuti program sosialisasi keamanan yang diadakan oleh desa.</ListItem>
    </List>
  },
  {
    id: 5,
    judul: 'Sistem Laporan Kejadian',
    image: '/api/img/securitydigital.png',
    deskripsi: <List>
      <ListItem>Jangan mudah membagikan informasi pribadi di media sosial.</ListItem>
      <ListItem>Waspada terhadap penipuan online dan telepon yang mengatasnamakan instansi resmi.</ListItem>
      <ListItem>Gunakan kata sandi yang kuat untuk akun digital dan ganti secara berkala.</ListItem>
    </List>
  },
  {
    id: 6,
    judul: 'Nomor Darurat yang Bisa Dihubungi',
    image: '/api/img/kontakpecalang.png',
    deskripsi: <List>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pecalang: 08125651052</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Ambulans: 08125651052</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Pemadam Kebakaran: 113</ListItem>
      <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Polisi: 110</ListItem>
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
          Tips Keamanan
        </Text>
        <Text px={{ base: 20, md: 150 }} ta={"center"} fz={{ base: "h4", md: "h3" }} >
          Desa Darmasaba berkomitmen untuk menjaga keamanan dan kenyamanan seluruh warganya. Berikut beberapa tips yang dapat membantu meningkatkan keamanan di lingkungan desa.
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
                    <Center p={10}>
                      <Image src={v.image} radius={10}
                     alt='' />
                    </Center>
                    <Box px={'xl'}>
                      <Box pb={20}>
                        <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                          {v.judul}
                        </Text>
                        <Box pr={10}>
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
