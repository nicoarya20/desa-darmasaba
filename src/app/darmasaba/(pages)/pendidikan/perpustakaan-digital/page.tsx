'use client'
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Center, Flex, Group, Image, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import BackButton from '../../desa/layanan/_com/BackButto';
import Link from 'next/link';


const dataSekolah = [
  {
    id: 1,
    gambar: '/api/img/buku-1.png',
    judul: 'Angkasa dan 56 Hari',
    deskripsi: 'Angkasa dan 56 hari mengisahkan tentang sebuah perjuangan perihal asa yang belum usai. Tentang cinta pertama yang secara tiba-tiba menghilang dari kehidupan.'
  },
  {
    id: 2,
    gambar: '/api/img/buku-2.png',
    judul: 'Sayuran Organik',
    deskripsi: 'Buku ini membahas cara menanam sayuran secara organik, jenis-jenis sayuran organik, dan cara mengatasi hama dan penyakit. '
  },
  {
    id: 3,
    gambar: '/api/img/buku-3.png',
    judul: 'Bali Tempo Dulu',
    deskripsi: 'Buku Bali Tempo Doeloe oleh Adrian Vickers berisi berbagai catatan perjalanan yang menggambarkan kehidupan sosial budaya Bali di masa lampau.'
  },
]


function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <Flex justify={'space-between'} align={'center'}>
          <BackButton />
          <ActionIcon variant='transparent' component={Link} href={'/darmasaba/pendidikan/perpustakaan-digital/login'}>
            <IconUser color={colors["blue-button"]} size={30} />
          </ActionIcon>
        </Flex>
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          E-Book Desa Darmasaba
        </Text>
        <Group justify='center' pb={20}>
          <TextInput
            w={{ base: "50%", md: "70%" }}
            placeholder='Cari Buku...'
            rightSection={
              <Button
                size="xs"
                style={{ height: '80%', marginRight: '5px' }}
                bg={colors["blue-button"]}
              >
                Cari
              </Button>
            }
            rightSectionWidth={70}
            leftSection={<IconSearch size={20} />}
          />
        </Group>
        <Group mb={20} gap="md" justify='center' wrap="wrap">
          <Paper bg={colors['blue-button']} radius="xl" py={5} px={20}>
            <Text c={colors['white-1']} size="sm">
              Semua
            </Text>
          </Paper>
          {['Non Fiksi', 'Sejarah', 'Edukasi', 'Fiksi'].map((kategori) => (
            <Paper key={kategori} bg={'gray'} radius="xl" py={5} px={20}>
              <Text c={colors['white-1']} size="sm">
                {kategori}
              </Text>
            </Paper>
          ))}
        </Group>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3
          }}
        >
          {dataSekolah.map((v, k) => {
            return (
              <Box key={k}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.8 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                    <Stack>
                      <Center>
                        <Image src={v.gambar} alt='' w={{ base: 390, md: 1000 }}/>
                      </Center>
                      <Text c={colors["blue-button"]} ta={'center'} fw={'bold'} fz={{ base: "h2", md: "h1" }}>{v.judul}</Text>
                      <Text c={colors["blue-button"]} ta={'center'} fw={'bold'}>{v.deskripsi}</Text>
                    </Stack>
                  </Paper>
                </motion.div>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
