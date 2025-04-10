import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconChristmasTreeFilled, IconHomeEco, IconShieldFilled, IconTrendingUp } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    deskripsi: 'Lingkungan Sehat',
    icon: <IconHomeEco size={80} color={colors['blue-button']} />,
  },
  {
    id: 2,
    deskripsi: 'Sumber Oksigen',
    icon: <IconChristmasTreeFilled size={80} color={colors['blue-button']} />,
  },
  {
    id: 3,
    deskripsi: 'Ekonomi Berkelanjutan',
    icon: <IconTrendingUp size={80} color={colors['blue-button']} />,
  },
  {
    id: 4,
    deskripsi: 'Mencegah Bencana',
    icon: <IconShieldFilled size={80} color={colors['blue-button']} />,
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
          Program Penghijauan Desa
        </Text>
        <Text px={20} ta={'center'} fz={'h4'}>Program Penghijauan Desa bertujuan untuk meningkatkan kesadaran masyarakat akan pentingnya lingkungan hijau melalui penanaman pohon dan perawatan tanaman.</Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={60}>
        <Text c={colors['blue-button']} fw={'bold'} py={10} px={28} fz={{ base: "lg", md: "xl" }} ta={"justify"}>
          Manfaat Program Penghijauan
        </Text>
        <SimpleGrid
          cols={{
            base: 1,
            md: 4
          }}>
          {data.map((v, k) => {
            return (
              <Box key={k}>
                <Paper p={20} bg={colors['white-trans-1']}>
                  <Stack flex={5}>
                    <Center>
                      {v.icon}
                    </Center>
                    <Box>
                      <Text fz={{ base: "lg", md: "xl" }} ta={'center'} c={colors['blue-button']} fw={'bold'}>{v.deskripsi}</Text>
                    </Box>
                    <Group justify='center'>
                    <Button bg={colors['blue-button']}>Detail</Button>
                    </Group>
                  </Stack>
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
