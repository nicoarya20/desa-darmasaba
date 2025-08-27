'use client'
import colors from '@/con/colors';
import { Box, List, ListItem, Paper, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconLeaf, IconPlant2, IconRecycle } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    title: 'Tujuan Edukasi Lingkungan',
    icon: <IconLeaf size={28} color={colors['blue-button']} />,
    listDeskripsi: [
      'Meningkatkan kesadaran masyarakat akan pentingnya lingkungan bersih dan sehat',
      'Mendorong partisipasi warga dalam pengelolaan sampah, penghijauan, dan konservasi',
      'Mengurangi dampak negatif kegiatan manusia terhadap lingkungan',
      'Membentuk generasi muda peduli isu-isu lingkungan',
    ],
  },
  {
    id: 2,
    title: 'Materi Edukasi yang Diberikan',
    icon: <IconRecycle size={28} color={colors['blue-button']} />,
    listDeskripsi: [
      'Pengelolaan sampah: pilah organik & anorganik',
      'Pencegahan pencemaran lingkungan (air, udara, tanah)',
      'Pemanfaatan lahan hijau dan penghijauan desa',
      'Daur ulang dan kreativitas dari sampah',
      'Bahaya pembakaran sampah sembarangan',
    ],
  },
  {
    id: 3,
    title: 'Contoh Kegiatan di Desa Darmasaba',
    icon: <IconPlant2 size={28} color={colors['blue-button']} />,
    listDeskripsi: [
      'Pelatihan membuat kompos dari sampah rumah tangga',
      'Gerakan "Jumat Bersih" rutin',
      'Workshop pembuatan ecobrick',
      'Lomba kebersihan antar banjar',
      'Sosialisasi lingkungan di sekolah dan posyandu',
    ],
  },
];

function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Text ta={'center'} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw="bold">
          Edukasi Lingkungan
        </Text>
        <Text ta={'center'} fz="h4" c="black">
          Program edukasi ini membimbing masyarakat untuk peduli dan bertanggung jawab terhadap alam,
          meningkatkan kesehatan, kenyamanan, dan keberlanjutan hidup bersama.
        </Text>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {data.map((item) => (
            <Paper key={item.id} p={20} bg={colors['white-trans-1']} shadow="md" radius="md">
              <Stack gap="md">
                <Box>
                  <Tooltip label={item.title} position="top" withArrow>
                    <Stack gap={4} align="center">
                      {item.icon}
                      <Text fz="h3" fw="bold" c={colors['blue-button']} ta="center">
                        {item.title}
                      </Text>
                    </Stack>
                  </Tooltip>
                </Box>
                <List fz="h4" spacing="sm" withPadding>
                  {item.listDeskripsi.map((desc, idx) => (
                    <ListItem key={idx}>{desc}</ListItem>
                  ))}
                </List>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
