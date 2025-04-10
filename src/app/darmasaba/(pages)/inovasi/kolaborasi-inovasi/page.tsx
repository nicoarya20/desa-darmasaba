import colors from '@/con/colors';
import { Stack, Box, Text, Paper, Flex, Group, SimpleGrid, Button, Image, Center } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconChevronDown } from '@tabler/icons-react';

const data = [
  {
    id: 1,
    bulan: 'JANUARI 2025',
    judul: 'Darmasaba Smart Waste',
    deskripsi: 'Sistem manajemen sampah terpadu yang memudahkan warga untuk memilah dan mendaur ulang sampah.',
    kolaborator: 'Kolaborator: DLH Kabupaten Badung, Komunitas Peduli Lingkungan, TPS3R Pudak Mesari'
  },
  {
    id: 2,
    bulan: 'FEBRUARI 2025',
    judul: 'Darmasaba Digital Market',
    deskripsi: 'Platform e-commerce untuk produk UMKM desa yang menghubungkan produsen lokal dengan pasar global.',
    kolaborator: 'Kolaborator: Kementerian Desa PDTT, UMKM Darmasaba'
  }
]
function Page() {
  return (
    <>
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Box px={{ base: 'md', md: 100 }} >
          <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
            Kolaborasi Inovasi
          </Text>
        </Box>
        <Box px={{ base: "md", md: 100 }}>
          <Stack gap={'lg'} justify='center'>
            <Group justify='flex-end'>
              <Paper bg={colors['blue-button']} p={5} w={{ base: 150, md: 300 }}>
                <Flex px={20} align={'center'} justify={'space-between'}>
                  <Text fz={'h4'} fw={'bold'} c={colors['white-1']}>Tahun</Text>
                  <IconChevronDown size={20} color={colors['white-1']} />
                </Flex>
              </Paper>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={'lg'}>
              {data.map((v, k) => {
                return (
                  <Paper p={'xl'} key={k}>
                    <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.judul}</Text>
                    <Box pr={'lg'} pb={20}>
                      {v.deskripsi}
                    </Box>
                    <Box pr={'lg'}>
                      {v.kolaborator}
                    </Box>
                  </Paper>
                );
              })}
            </SimpleGrid>
            <Group py={40} justify='center'>
              <Button px={80} rightSection={<IconChevronDown />} radius={6} bg={colors["blue-button"]} c={colors["white-1"]}>Lihat Laporan Lainnya</Button>
            </Group>
          </Stack>
        </Box>
      </Stack>
      <Box py={40} px={{ base: "md", md: 100 }} bg={colors['white-trans-1']}>
        <Stack gap={'lg'} justify='center'>
          <Box px={{ base: 'md', md: 100 }} >
            <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
              Mitra Kolaborasi
            </Text>
            <Text ta={'center'} fz={'h4'}>Kami berkolaborasi dengan berbagai mitra dari berbagai sektor untuk mewujudkan visi Smart Village Darmasaba.</Text>
          </Box>
          <Center>
            <Image src={'/api/img/logoukm-kolaborasiinvoasi.png'} alt='' w={{base: 500, md: 650}}/>
          </Center>
        </Stack>
      </Box>
    </>
  );
}

export default Page;
