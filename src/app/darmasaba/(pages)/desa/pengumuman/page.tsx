import colors from '@/con/colors';
import { Anchor, Box, Container, Flex, Group, Notification, Paper, SimpleGrid, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { IconCalendar, IconClock, IconSearch } from '@tabler/icons-react';
import BackButton from '../layanan/_com/BackButto';
import Link from 'next/link';

const dataKategori = [
  {
    id: 1,
    kategori: 'Sosial & Kesehatan',
    jumlah: 5,
    link: '/darmasaba/desa/pengumuman/sosial-&-kesehatan'
  },
  {
    id: 2,
    kategori: 'Ekonomi & UMKM',
    jumlah: 7,
    link: '/darmasaba/desa/pengumuman/ekonomi-&-umkm'
  },
  {
    id: 3,
    kategori: 'Pendidikan & Kepemudaan',
    jumlah: 9,
    link: '/darmasaba/desa/pengumuman/pendidikan-&-kepemudaan'
  },
  {
    id: 4,
    kategori: 'Lingkungan & Bencana',
    jumlah: 6,
    link: '/darmasaba/desa/pengumuman/lingkungan-&-bencana'
  },
  {
    id: 5,
    kategori: 'Adat & Budaya',
    jumlah: 8,
    link: '/darmasaba/desa/pengumuman/adat-&-budaya'
  },
  {
    id: 6,
    kategori: 'Digitalisasi Desa',
    jumlah: 6,
    link: '/darmasaba/desa/pengumuman/digitalisasi-desa'
  },
]
const dataPenting = [
  {
    id: 1,
    judul: 'Jadwal Rapat',
    jumlah: 5,
    link: '/darmasaba/desa/pengumuman/jadwal-rapat'
  },
  {
    id: 2,
    judul: 'Pendaftaran UMKM',
    jumlah: 7,
    link: '/darmasaba/desa/pengumuman/pendaftaran-umkm'
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
        <Stack align="center" gap="0" >
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Pengumuman Desa Darmasaba
          </Text>
          <Text ta="center" px="md" pb={10}>
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
              <Group style={{ color: 'black' }}>
                <Group gap="xs">
                  <IconCalendar size={18} />
                  <Text size="sm">Kamis, 13 Januari 2025</Text>
                </Group>
                <Group gap="xs">
                  <IconClock size={18} />
                  <Text size="sm">09:00 WITA</Text>
                </Group>
              </Group>
              <Anchor>
                <Text fs={'unset'} c={colors["blue-button"]} fz={"sm"}>Baca Selengkapnya</Text>
              </Anchor>
            </Flex>
          </Notification>
          <Paper p={"md"}>
            <Stack gap={"xs"}>
              <Text fw={"bold"} fz={"lg"} c={colors['blue-button']}>Kategori</Text>
              {dataKategori.map((v, k) => {
                return (
                  <UnstyledButton component={Link} href={v.link} key={k}>
                    <Paper bg={colors["BG-trans"]} p={5}>
                      <Group px={3} justify={"space-between"}>
                        <Text fz={"md"} c={"black"}>{v.kategori}</Text>
                        <Text fz={"md"} c={"black"}>{v.jumlah}</Text>
                      </Group>
                    </Paper>
                  </UnstyledButton>
                )
              })}
            </Stack>
          </Paper>
          <Notification color='yellow' styles={{ title: { fontWeight: "bold" } }} withCloseButton={false} title="Informasi">
            <Stack gap={"xs"}>
              <Text fz={"sm"} fw={"bold"} c={"black"}>LELANG PEMASANGAN CCTV DESA DARMASABA</Text>
              <Text ta={"justify"} fz={"sm"} c={"black"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sagittis nec arcu ac ornare. Praesent a porttitor felis. Proin varius ex nisl, in hendrerit odio tristique vel. </Text>
            </Stack>
            <Flex pt={20} gap={"md"} justify={"space-between"}><Group style={{ color: 'black' }}>
              <Group gap="xs">
                <IconCalendar size={18} />
                <Text size="sm">Kamis, 2 Februari 2025</Text>
              </Group>
              <Group gap="xs">
                <IconClock size={18} />
                <Text size="sm">10:00 WITA</Text>
              </Group>
            </Group>
              <Anchor>
                <Text fs={'unset'} c={colors["blue-button"]} fz={"sm"}>Baca Selengkapnya</Text>
              </Anchor>
            </Flex>
          </Notification>
          <Paper p={"md"}>
            <Stack gap={"xs"}>
              <Text fw={"bold"} fz={"lg"} c={colors['blue-button']}>Pengumuman Penting</Text>
              {dataPenting.map((v, k) => {
                return (
                  <UnstyledButton component={Link} href={v.link} key={k}>
                    <Paper bg={colors["BG-trans"]} p={5}>
                      <Group px={3} justify={"space-between"}>
                        <Text fz={"md"} c={"black"}>{v.judul}</Text>
                        <Text fz={"md"} c={"black"}>{v.jumlah}</Text>
                      </Group>
                    </Paper>
                  </UnstyledButton>
                )
              })}
            </Stack>
          </Paper>
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
