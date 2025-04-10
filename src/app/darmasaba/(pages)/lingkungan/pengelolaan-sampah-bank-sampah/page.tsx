import colors from '@/con/colors';
import { Box, Flex, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconClipboardTextFilled, IconMapPin, IconRecycle, IconScale, IconSearch, IconTrashFilled, IconTruckFilled } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    icon: <IconRecycle size={50} color={colors['blue-button']} />,
    deskripsi: '1. Pilah sampah sesuai jenisnya'
  },
  {
    id: 2,
    icon: <IconTruckFilled size={50} color={colors["blue-button"]} />,
    deskripsi: '2. Bawa sampah ke Bank Sampah'
  },
  {
    id: 3,
    icon: <IconScale size={50} color={colors["blue-button"]} />,
    deskripsi: '3. Timbang sampah di Bank Sampah'
  },
  {
    id: 4,
    icon: <IconClipboardTextFilled size={50} color={colors["blue-button"]} />,
    deskripsi: '4. Catat hasil timbangan di buku tabungan'
  },
  {
    id: 5,
    icon: <IconTrashFilled size={50} color={colors["blue-button"]} />,
    deskripsi: '5. Sampah didaur ulang oleh petugas Bank Sampah'
  },
]

const bankSampah = [
  {
    id: 1,
    icon: <IconMapPin size={50} color={colors['blue-button']} />,
    deskripsi: 'Bank Sampah Sarana Gathi',
    alamat: 'Jl. Ahmad Yani Utara No.453, Peguyangan, Kec. Denpasar Utara, Kota Denpasar, Bali 80115'
  },
  {
    id: 2,
    icon: <IconMapPin size={50} color={colors['blue-button']} />,
    deskripsi: 'Bank Sampah BALI WASTU LESTARI',
    alamat: 'Jl. Ahmad Yani Utara Gg. Garuda No.1, Peguyangan, Kec. Denpasar Utara, Kota Denpasar, Bali 80115'
  },
  {
    id: 3,
    icon: <IconMapPin size={50} color={colors['blue-button']} />,
    deskripsi: 'Bank Sampah Jempiring Sari',
    alamat: 'Jl. Gn. Lebah I No.9, Tegal Harum, Kec. Denpasar Bar., Kota Denpasar, Bali 80119'
  },
  {
    id: 4,
    icon: <IconMapPin size={50} color={colors['blue-button']} />,
    deskripsi: 'Bank Sampah Sarana Gathi',
    alamat: 'Jl. Ahmad Yani Utara No.453, Peguyangan, Kec. Denpasar Utara, Kota Denpasar, Bali 80115'
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
          Pengelolaan Sampah (Bank Sampah)
        </Text>
        <Text px={20} ta={'center'} fz={'h4'}>Bank Sampah di Desa Darmasaba berfungsi sebagai tempat pengelolaan sampah yang bertujuan untuk mengurangi limbah dan memberikan manfaat ekonomi bagi masyarakat.</Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={60}>
        <Text fw={'bold'} py={10} px={28} fz={{ base: "lg", md: "xl" }} ta={"justify"}>
          Mekanisme Bank Sampah di Desa Darmasaba:
        </Text>
        <SimpleGrid
          cols={{
            base: 1,
            md: 1,
          }}
        >
          {data.map((v, k) => {
            return (
              <Box key={k} px={28}>
                <Paper p={20} bg={colors['white-trans-1']}>
                  <Flex gap={20} align={'center'}>
                    <Box>
                      {v.icon}
                    </Box>
                    <Text fw={'bold'} fz={{ base: "lg", md: "xl" }} c={'black'}>{v.deskripsi}</Text>
                  </Flex>
                </Paper>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>

      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Keterangan Bank Sampah Terdekat
        </Text>
        <TextInput
          mb={20}
          radius={'xl'}
          px={{ base: 70, md: 150 }}
          leftSection={<IconSearch size={20} />}
          placeholder='Cari Bank Sampah Terdekat'
        />
        <SimpleGrid
          cols={{
            base: 1,
            md: 2,
          }}>
          <Box>
            <SimpleGrid
              cols={{
                base: 1,
                md: 1,
              }}
            >
              {bankSampah.map((v, k) => {
                return (
                  <Box key={k} px={20}>
                    <Paper p={20} bg={colors['white-trans-1']} radius={'lg'}>
                      <Flex gap={20} align={'center'}>
                        <Box>
                          {v.icon}
                        </Box>
                        <Box>
                          <Text fw={'bold'} fz={{ base: "lg", md: "xl" }} c={'black'}>
                            {v.deskripsi}
                          </Text>
                          <Text fz={{ base: "md", md: "lg" }} c={'black'}>
                            {v.alamat}
                          </Text>
                        </Box>
                      </Flex>
                    </Paper>
                  </Box>
                )
              })}
            </SimpleGrid>
          </Box>
          <Box style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '90.5%', // Aspek rasio 16:9 (atau gunakan '100%' untuk aspek rasio 1:1)
            height: 0,
            overflow: 'hidden'
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31558.578355337635!2d115.18413781150647!3d-8.613053599999985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23ff3a9d0f0ab%3A0xb6bb54a820adbae6!2sBank%20Sampah%20Sarana%20Gathi!5e0!3m2!1sid!2sid!4v1743994947623!5m2!1sid!2sid"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
              loading="lazy"
              allowFullScreen
            ></iframe>
          </Box>
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
