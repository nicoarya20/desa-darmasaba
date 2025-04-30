import colors from '@/con/colors';
import { Box, Center, Container, Divider, Grid, GridCol, Group, Image, Pagination, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import React from 'react';

const dataBeritaTerbaru = [
  {
    id: 1,
    judul: 'PEMBANGUNAN GOT JALAN LINGKUNGAN BR. TAMAN',
    image: "/api/img/pembangunan-1.jpg",
    tanggal: "Kamis, 13 Januari 2025",
  },
  {
    id: 2,
    judul: 'PEMBANGUNAN BALE GAMBELAN SETRA AGENG DESA ADAT TEGAL',
    image: "/api/img/pembangunan-3.jpg",
    tanggal: "Kamis, 13 Januari 2025",
  },
  {
    id: 3,
    judul: 'PEMBANGUNAN TROTOARISASI JALAN LINGKUNGAN BR. GULINGAN',
    image: "/api/img/pembangunan-1.jpg",
    tanggal: "Selasa, 11 Januari 2025",
  },
]
function Pembangunan() {
  return (
    <Box py={20}>
      <Container size="xl" px={{ base: "md", md: "xl" }}>
        <Grid gutter={{ base: "md", md: "xl" }} pb={70}>
          {/* Berita Utama */}
          <GridCol span={{ base: 12, xl: 8 }}>
            <Paper p="md" shadow="sm" radius="md">
              <Stack gap="md">
                <Box>
                  <Image
                    src="/api/img/pembangunan-1.jpg"
                    alt="PEMBANGUNAN TROTOARISASI JALAN LINGKUNGAN BR. GULINGAN"
                    radius="md"
                    fit="cover"
                    h={{ base: 450, md: 615 }}
                  />
                </Box>
                <Group>
                  <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                    <Text size="sm">Pembangunan</Text>
                  </Paper>
                </Group>
                <Text fz={{ base: "xl", md: "2xl" }} fw="bold" lineClamp={2}>
                PEMBANGUNAN TROTOARISASI JALAN LINGKUNGAN BR. GULINGAN
                </Text>
                <Text size="md" lineClamp={3}>
                Sudah tertata rapi dan bersih niki Semeton Darmasaba! Sekarang pejalan kaki di seputaran jalan lingkungan Br. Gulingan bisa aman dan nyaman nie!!!

Pemdes Darmasaba dalam rangka memenuhi kebutuhan masyarakat khususnya warga Br. Gulingan yang memerlukan trotoarisasi guna memperlancar saluran air dan memberikan kenyamanan ketika berjalan, kini sudah menyelesaikan pembangunan trotoarisasi jalan lingkungan Br. Gulingan. Pembangunan tersebut menggunakan APBDes Darmasaba T. A. 2023 dengan realisasi sebesar Rp357.011.299,00 dari pagu yang disiapkan sebesar Rp439.066.327,00. Pembangunan trotoar tersebut melibatkan pekerja lokal dan dibantu oleh warga Br. Gulingan.
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
          <GridCol span={{ base: 12, xl: 4 }}>
            <Stack gap="md">
              {/* Berita Sampingan 1 */}
              <Paper p="md" shadow="sm" radius="md">
                <Stack gap="sm">
                  <Image
                    radius="md"
                    src="/api/img/pembangunan-2.jpg"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={300}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Pembangunan</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                  PEMBANGUNAN GOT JALAN LINGKUNGAN BR. TAMAN
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
                    src="/api/img/pembangunan-3.jpg"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={250}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Pembangunan</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                  PEMBANGUNAN BALE GAMBELAN SETRA AGENG DESA ADAT TEGAL
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
                    h={200}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Pembangunan</Text>
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

export default Pembangunan;
