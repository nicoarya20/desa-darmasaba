import colors from '@/con/colors';
import { ActionIcon, Box, Center, Container, Flex, Image, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconPhoto, IconSearch, IconVideo } from '@tabler/icons-react';
import BackButton from '../layanan/_com/BackButto';

const data = [
  {
    id: 1,
    image: "/api/img/galeri-1.png",
    title: "Pendapatan",
    tanggal: "3 Mar 2025",
    judul: "Pemasangan Wifi Gratis Di Publik Desa",

  },
  {
    id: 2,
    image: "/api/img/galeri-2.png",
    title: "Belanja",
    tanggal: "4 Mar 2025",
    judul: "Panen raya Desa Darmasaba",
  },
  {
    id: 3,
    image: "/api/img/galeri-3.png",
    title: "Pembiayaan",
    tanggal: "5 Mar 2025",
    judul: "Kegiatan Pembangunan Pelinggih",
  }
]
function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md">
        <Stack align="center" gap="xs" mb="xl">
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Galeri Kegiatan Desa Darmasaba
          </Text>
        </Stack>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Flex justify={"space-between"} align={"center"} pb={50}>
          <Flex gap={"lg"}>
            <ActionIcon variant='transparent' p={50}>
              <Flex c={colors["blue-button"]} align={"center"} gap={10}>
                <IconPhoto size={35} />
                <Text fz={"h4"}>Foto</Text>
              </Flex>
            </ActionIcon>
            <ActionIcon variant='transparent' p={50}>
              <Flex c={colors["blue-button"]} align={"center"} gap={10}>
                <IconVideo size={35} />
                <Text fz={"h4"}>Video</Text>
              </Flex>
            </ActionIcon>
          </Flex>
          <TextInput
            placeholder='Cari Galeri'
            radius="lg"
            leftSection={<IconSearch size={20} />}
            w={{ base: "25%", md: "30%" }}
          />
        </Flex>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3,
          }}>
          {data.map((v, k) => {
            return (
              <Box key={k}>
                <Paper mb={50} p={"md"} radius={26} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                  <Box>
                    <Center>
                      <Image src={v.image} alt='' />
                    </Center>
                  </Box>
                  <Box>
                    <Stack gap={"sm"} py={10}>
                      <Text fz={{ base: "sm", md: "sm" }}>{v.tanggal}</Text>
                      <Text fw={"bold"} fz={{ base: "sm", md: "sm" }}>{v.judul}</Text>
                      <Text ta={"justify"} fz={{ base: "sm", md: "sm" }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Fusce sagittis nec arcu ac ornare. Praesent a porttitor
                        felis. Proin varius ex nisl, in hendrerit odio tristique vel. </Text>
                    </Stack>
                  </Box>
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
