import colors from '@/con/colors';
import { Box, Center, Container, Divider, Grid, GridCol, Group, Image, Pagination, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import React from 'react';

const dataBeritaTerbaru = [
  {
    id: 1,
    judul: 'Darmasaba Luncurkan Aplikasi Smart Village untuk Pelayanan Publik',
    image: "/api/img/berita-1.png",
    tanggal: "Selasa, 11 Januari 2025",
  },
  {
    id: 2,
    judul: 'Tim Voli Darmasaba Raih Juara Turnamen Desa',
    image: "/api/img/prestasi-voli.jpeg",
    tanggal: "Kamis, 13 Januari 2025",
  },
  {
    id: 3,
    judul: 'Tim Voli Darmasaba Raih Juara Turnamen Desa',
    image: "/api/img/prestasi-voli.jpeg",
    tanggal: "Kamis, 13 Januari 2025",
  },
]
function Budaya() {
  return (
    <Box py={20}>
      <Container size="xl" px={{ base: "md", md: "xl" }}>
        <Grid gutter={{ base: "md", md: "xl" }} pb={70}>
          {/* Berita Utama */}
          <GridCol span={{ base: 12, md: 8 }}>
            <Paper p="md" shadow="sm" radius="md">
              <Stack gap="md">
                <Box>
                  <Image
                    src="/api/img/berita-1.png"
                    alt="Darmasaba Smart Village"
                    radius="md"
                    fit="cover"
                    h={{ base: 450, md: 660 }}
                  />
                </Box>
                <Group>
                  <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                    <Text size="sm">Teknologi</Text>
                  </Paper>
                </Group>
                <Text fz={{ base: "xl", md: "2xl" }} fw="bold" lineClamp={2}>
                  Darmasaba Luncurkan Aplikasi Smart Village untuk Pelayanan Publik
                </Text>
                <Text size="md" lineClamp={3}>
                  Desa Darmasaba mengambil langkah maju dalam transformasi digital dengan meluncurkan aplikasi Smart Village yang memudahkan warga dalam mengakses layanan publik secara online.
                </Text>
                <Group>
                  <Group gap="xs">
                    <IconCalendar size={18} />
                    <Text size="sm">Selasa, 11 Januari 2025</Text>
                  </Group>
                  <Group gap="xs">
                    <IconUser size={18} />
                    <Text size="sm">Admin Desa</Text>
                  </Group>
                </Group>
              </Stack>
            </Paper>
          </GridCol>

          {/* Berita Sampingan */}
          <GridCol span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Berita Sampingan 1 */}
              <Paper p="md" shadow="sm" radius="md">
                <Stack gap="sm">
                  <Image
                    radius="md"
                    src="/api/img/prestasi-voli.jpeg"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={180}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Teknologi</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                    Darmasaba Luncurkan Aplikasi Smart Village untuk Pelayanan Publik
                  </Text>
                  <Group>
                    <Group gap="xs">
                      <IconCalendar size={18} />
                      <Text size="sm">Selasa, 11 Januari 2025</Text>
                    </Group>
                    <Group gap="xs">
                      <IconUser size={18} />
                      <Text size="sm">Admin Desa</Text>
                    </Group>
                  </Group>
                </Stack>
              </Paper>

              {/* Berita Sampingan 2 */}
              <Paper p="md" shadow="sm" radius="md">
                <Stack gap="sm">
                  <Image
                    radius="md"
                    src="/api/img/prestasi-voli.jpeg"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={180}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Sosial</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                    Tim Voli Darmasaba Raih Juara Turnamen Desa
                  </Text>
                  <Group>
                    <Group gap="xs">
                      <IconCalendar size={18} />
                      <Text size="sm">Selasa, 11 Januari 2025</Text>
                    </Group>
                    <Group gap="xs">
                      <IconUser size={18} />
                      <Text size="sm">Admin Desa</Text>
                    </Group>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </GridCol>
        </Grid>
        <Box pb={30}>
          <Text fz={"h1"} fw={"bold"}>Berita Terbaru</Text>
          <Divider color={colors["blue-button"]} />
        </Box>
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          {dataBeritaTerbaru.map((v, k) => {
            return (
              <Paper key={k} p="md" shadow="sm" radius="md">
                <Stack gap="sm">
                  <Image
                    radius="md"
                    src={v.image}
                    alt="Prestasi Voli"
                    fit="cover"
                    h={180}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Teknologi</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                    {v.judul}
                  </Text>
                  <Group>
                    <Group gap="xs">
                      <IconCalendar size={18} />
                      <Text size="sm">{v.tanggal}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconUser size={18} />
                      <Text size="sm">Admin Desa</Text>
                    </Group>
                  </Group>
                </Stack>
              </Paper>
            )
          })}
        </SimpleGrid>
        <Box py={"xl"}>
          <Center>
            <Pagination total={10} />
          </Center>
        </Box>
      </Container>
    </Box>
  );
}

export default Budaya;
