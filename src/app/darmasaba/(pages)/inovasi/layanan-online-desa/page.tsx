import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconBell, IconFileCheckFilled, IconMessageCircleQuestion } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    icon: <IconFileCheckFilled size={50} color={colors['blue-button']} />,
    judul: 'Administrasi Online',
    deskripsi: 'Pengurusan surat dan dokumen secara digital tanpa perlu datang ke kantor desa'
  },
  {
    id: 2,
    icon: <IconMessageCircleQuestion size={50} color={colors['blue-button']} />,
    judul: 'Pengaduan Masyarakat',
    deskripsi: 'Sampaikan keluhan dan aspirasi Anda melalui platform digital kami'
  },
  {
    id: 3,
    icon: <IconBell size={50} color={colors['blue-button']} />,
    judul: 'Informasi Desa',
    deskripsi: 'Akses berita dan pengumuman terbaru seputar kegiatan desa'
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
          Layanan Online Desa
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 1
            }}
          >
            {data.map((v, k) => {
              return (
                <Stack key={k} >

                  <Paper p={'xl'} >
                    <Box>
                      {v.icon}
                    </Box>
                    <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.judul}</Text>
                    <Text fz={'lg'} c={'black'}>{v.deskripsi}</Text>
                  </Paper>
                </Stack>
              )
            })}
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
