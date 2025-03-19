import colors from '@/con/colors';
import { Stack, Box, Container, Text, TextInput, SimpleGrid, Notification, Flex, Anchor, Paper } from '@mantine/core';
import React from 'react';
import BackButton from '../layanan/_com/BackButto';
import { IconSearch } from '@tabler/icons-react';

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
            Pengumuman Desa Darmasaba
          </Text>
          <Text ta="center" px="md">
            Informasi dan pengumuman resmi terkait kegiatan dan kebijakan Desa Darmasaba
          </Text>
          <TextInput
            placeholder='Cari Pengumuman'
            radius="lg"
            leftSection={<IconSearch size={20} />}
            w={{ base: "55%", md: "70%" }}
          />
        </Stack>
      </Container>

      <Box px={{ base: "md", md: 100 }}>
        <SimpleGrid
          cols={{
            base: 1,
            md: 2,
          }}
        >
          <Notification styles={{ title: { fontWeight: "bold" } }} withCloseButton={false} title="Penting">
            <Stack gap={"xs"}>
              <Text fz={"sm"} fw={"bold"} c={"black"}>PENGUMUMAN LOWONGAN KERJA TPS3R PUDAK MESARI DESA DARMASABA</Text>
              <Text ta={"justify"} fz={"sm"} c={"black"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sagittis nec arcu ac ornare. Praesent a porttitor felis. Proin varius ex nisl, in hendrerit odio tristique vel. </Text>
            </Stack>
            <Flex pt={20} gap={"md"} justify={"space-between"}>
              <Text fz={"xs"} c={"black"}>1 Februari 2025</Text>
              <Text fz={"xs"} c={"black"}>09:00 WITA</Text>
              <Anchor>
                <Text fz={"xs"}>Baca Selengkapnya</Text>
              </Anchor>
            </Flex>
          </Notification>
          <Paper p={"md"}>
            <Stack gap={"xs"}>
              <Text fw={"bold"} fz={"lg"} c={colors['blue-button']}>Kategori</Text>
              <Flex justify={"space-between"}>
                <Text fz={"md"} c={"black"}>Pengumuman</Text>
                <Text fz={"md"} c={"black"}>5</Text>
              </Flex>
              <Flex justify={"space-between"}>
                <Text fz={"md"} c={"black"}>Kegiatan</Text>
                <Text fz={"md"} c={"black"}>10</Text>
              </Flex>
              <Flex justify={"space-between"}>
                <Text fz={"md"} c={"black"}>Informasi</Text>
                <Text fz={"md"} c={"black"}>12</Text>
              </Flex>
              <Flex justify={"space-between"}>
                <Text fz={"md"} c={"black"}>Layanan</Text>
                <Text fz={"md"} c={"black"}>6</Text>
              </Flex>
            </Stack>
          </Paper>
          <Notification color='yellow' styles={{ title: { fontWeight: "bold" } }} withCloseButton={false} title="Informasi">
            <Stack gap={"xs"}>
              <Text fz={"sm"} fw={"bold"} c={"black"}>LELANG PEMASANGAN CCTV DESA DARMASABA</Text>
              <Text ta={"justify"} fz={"sm"} c={"black"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sagittis nec arcu ac ornare. Praesent a porttitor felis. Proin varius ex nisl, in hendrerit odio tristique vel. </Text>
            </Stack>
            <Flex pt={20} gap={"md"} justify={"space-between"}>
              <Text fz={"xs"} c={"black"}>2 Februari 2025</Text>
              <Text fz={"xs"} c={"black"}>10:00 WITA</Text>
              <Anchor>
                <Text fz={"xs"}>Baca Selengkapnya</Text>
              </Anchor>
            </Flex>
          </Notification>
          <Paper p={"md"}>
            <Stack gap={"xs"}>
              <Text fw={"bold"} fz={"lg"} c={colors['blue-button']}>Pengumuman Penting</Text>
              <Flex justify={"space-between"}>
                <Text fz={"md"} c={"black"}>Jadwal Rapat</Text>
                <Text fz={"md"} c={"black"}>5</Text>
              </Flex>
              <Flex justify={"space-between"}>
                <Text fz={"md"} c={"black"}>Pendaftaran UMKM</Text>
                <Text fz={"md"} c={"black"}>10</Text>
              </Flex>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
