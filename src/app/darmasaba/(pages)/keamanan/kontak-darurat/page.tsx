import colors from '@/con/colors';
import { Avatar, Box, Flex, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAmbulance, IconBadge, IconBuildingBank, IconBuildingSkyscraper, IconFiretruck, IconFirstAidKit, IconPhoneCall, IconUser } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

const emergencyServices = [
  {
    id: 1,
    name: "Polisi",
    icon: <IconBadge size={24} color={colors['blue-button']} />,
    nomor: '081xxxxxxxxx'
  },
  {
    id: 2,
    name: "Ambulans",
    icon: <IconAmbulance size={24} color={colors['blue-button']} />,
    nomor: '081xxxxxxxxx'
  },
  {
    id: 3,
    name: "Pemadam Kebakaran",
    icon: <IconFiretruck size={24} color={colors['blue-button']} />,
    nomor: '081xxxxxxxxx'
  }
];

const healthFacilities = [
  {
    id: 4,
    name: "Puskesmas Darmasaba",
    icon: <IconFirstAidKit size={24} color={colors['blue-button']} />,
    nomor: '081xxxxxxxxx'
  },
  {
    id: 5,
    name: "UGD Terdekat",
    icon: <IconAmbulance size={24} color={colors['blue-button']} />,
    nomor: '081xxxxxxxxx'
  }
];

const villageGovernment = [
  {
    id: 6,
    name: "Kantor Desa Darmasaba",
    icon: <IconBuildingSkyscraper size={24} color={colors['blue-button']} />,
    nomor: '081xxxxxxxxx'
  },
  {
    id: 7,
    name: "Kepala Desa",
    icon: <IconUser size={24} color={colors['blue-button']} />,
    nomor: '081xxxxxxxxx'
  }
];
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Kontak Darurat
        </Text>
        <Text px={{ base: 20, md: 150 }} ta={"center"} fz={{ base: "h4", md: "h3" }} >
          Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung.
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
            <Flex justify={'center'} gap={'lg'} align={'center'}>
              <Avatar radius={"xl"} size={'lg'} bg={colors['BG-trans']}>
                <IconPhoneCall size={30} color={colors["blue-button"]} />
              </Avatar>
              <Box>
                <Text ta={'center'} c={colors['blue-button']} py={10} fz={{ base: "md", md: "h4" }} fw={"bold"} >
                  Nomor Darurat Utama
                </Text>
                <Text ta={'center'} fw={"bold"} fz={'h2'} c={colors["blue-button"]}>112</Text>
              </Box>
            </Flex>
          </Paper>
        </Stack>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* Layanan Darurat */}
          <Paper p="lg" radius="md" bg={colors['white-trans-1']}>
            <Group pb="md" align="center">
              <Avatar radius={"xl"} size={'lg'} bg={colors['BG-trans']}>
                <IconFirstAidKit size={30} color={colors["blue-button"]} />
              </Avatar>
              <Text fw="bold" fz={{ base: "lg", md: "xl" }} c={colors["blue-button"]}>
                Layanan Darurat
              </Text>
            </Group>

            {emergencyServices.map((v, k) => (
              <Group key={k} px="md" py="sm" bg={colors['BG-trans']} mb="xs" justify="space-between" style={{ borderRadius: 8 }}>
                <Group>
                  {v.icon}
                  <Text>{v.name}</Text>
                </Group>
                <Text>{v.nomor}</Text>
              </Group>
            ))}
          </Paper>

          {/* Fasilitas Kesehatan */}
          <Paper p="lg" radius="md" bg={colors['white-trans-1']}>
            <Group pb="md" align="center">
              <Avatar radius={"xl"} size={'lg'} bg={colors['BG-trans']}>
                <IconBuildingSkyscraper size={30} color={colors["blue-button"]} />
              </Avatar>
              <Text fw="bold" fz={{ base: "lg", md: "xl" }} c={colors["blue-button"]}>
                Fasilitas Kesehatan
              </Text>
            </Group>

            {healthFacilities.map((v, k) => (
              <Group key={k} px="md" py="sm" bg={colors['BG-trans']} mb="xs" justify="space-between" style={{ borderRadius: 8 }}>
                <Group>
                  {v.icon}
                  <Text>{v.name}</Text>
                </Group>
                <Text>{v.nomor}</Text>
              </Group>
            ))}
          </Paper>

          {/* Pemerintah Desa */}
          <Paper p="lg" radius="md" bg={colors['white-trans-1']}>
            <Group pb="md" align="center">
              <Avatar radius={"xl"} size={'lg'} bg={colors['BG-trans']}>
                <IconBuildingBank size={30} color={colors["blue-button"]} />
              </Avatar>
              <Text fw="bold" fz={{ base: "lg", md: "xl" }} c={colors["blue-button"]}>
                Pemerintah Desa
              </Text>
            </Group>

            {villageGovernment.map((v, k) => (
              <Group key={k} px="md" py="sm" bg={colors['BG-trans']} mb="xs" justify="space-between" style={{ borderRadius: 8 }}>
                <Group>
                  {v.icon}
                  <Text>{v.name}</Text>
                </Group>
                <Text>{v.nomor}</Text>
              </Group>
            ))}
          </Paper>
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
