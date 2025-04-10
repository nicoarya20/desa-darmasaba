import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconChristmasTree, IconDroplet, IconHome, IconLeaf, IconTrash } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    icon: <IconLeaf size={100} color={colors['blue-button']} />,
    title: 'Luas Lahan Hijau',
    jumlah: '± 25 hektar',
    deskripsi: 'tersebar di area persawahan, kebun, dan taman desa.'
  },
  {
    id: 2,
    icon: <IconHome size={100} color={colors['blue-button']} />,
    title: 'Jumlah Rumah Tangga',
    jumlah: '± 1.500 rumah tangga',
    deskripsi: 'yang mayoritas sudah memiliki fasilitas pengelolaan sampah mandiri.'
  },
  {
    id: 3,
    icon: <IconDroplet size={100} color={colors['blue-button']} />,
    title: 'Jumlah Sungai dan Saluran Air',
    jumlah: '± 3 Sungai Besar',
    deskripsi: 'dan beberapa saluran irigasi tradisional (subak) yang masih aktif digunakan.'
  },
  {
    id: 4,
    icon: <IconChristmasTree size={100} color={colors['blue-button']} />,
    title: 'Program Penghijauan',
    jumlah: '± 1000 Pohon',
    deskripsi: 'Dilaksanakan secara berkala melalui kegiatan menanam pohon di area umum dan perbukitan.'
  },
  {
    id: 5,
    icon: <IconTrash size={100} color={colors['blue-button']} />,
    title: 'Pengelolaan Sampah',
    jumlah: '± 5 Bank Sampah',
    deskripsi: 'Didukung oleh Bank Sampah dan sistem pemilahan sampah rumah tangga.'
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
          Data Lingkungan Desa
        </Text>
        <Text px={20} ta={'center'} fz={'h4'}>Desa Darmasaba memiliki lingkungan yang terus dijaga dan dikembangkan demi kesejahteraan warganya. Upaya pelestarian lingkungan difokuskan pada penghijauan, pengelolaan sampah, serta perlindungan kawasan hijau.</Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <SimpleGrid
          cols={{
            base: 1,
            md: 2,
          }}>
          {data.map((v, k) => {
            return (
              <Box key={k}>
                <Paper p={20} bg={colors['white-trans-1']}>
                  <Text fw={'bold'} c={colors['blue-button']} fz={{ base: "lg", md: "xl" }} >
                    {v.title}
                  </Text>
                  <Box>
                    {v.icon}
                    <Text c={colors['blue-button']} fz={'h4'} fw={'bold'}>
                      {v.jumlah}
                    </Text>
                  </Box>
                  <Text fz={{ base: "lg", md: "xl" }} >
                    {v.deskripsi}
                  </Text>

                </Paper>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
