import colors from '@/con/colors';
import { Box, Center, Container, Divider, Grid, GridCol, Group, Image, Pagination, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import React from 'react';

const dataBeritaTerbaru = [
  {
    id: 1,
    judul: 'PEMBERIAN HASIL PANEN JAGUNG PROGRAM KETAHANAN PANGAN DESA KEPADA ANAK YATIM, PIATU DAN YATIM-PIATU DESA DARMASABA',
    image: "/api/img/berita-pemerintahan.jpg",
    tanggal: "Selasa, 11 Januari 2025",
  },
  {
    id: 2,
    judul: 'Tim Voli Darmasaba Raih Juara Turnamen Desa',
    image: "/api/img/pemrintahan-5.png",
    tanggal: "Kamis, 13 Januari 2025",
  },
  {
    id: 3,
    judul: 'PEMBERIAN HASIL PANEN JAGUNG PROGRAM KETAHANAN PANGAN DESA KEPADA ANAK YATIM, PIATU DAN YATIM-PIATU DESA DARMASABA',
    image: "/api/img/berita-pemerintahan.jpg",
    tanggal: "Kamis, 13 Januari 2025",
  },
]
function Pemerintahan() {
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
                    src="/api/img/berita-pemerintahan.jpg"
                    alt="Darmasaba Smart Village"
                    radius="md"
                    fit="cover"
                    h={{ base: 450, md: 615 }}
                  />
                </Box>
                <Group>
                  <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                    <Text size="sm">Pemerintahan</Text>
                  </Paper>
                </Group>
                <Text fz={{ base: "xl", md: "2xl" }} fw="bold" lineClamp={2}>
                PEMBERIAN HASIL PANEN JAGUNG PROGRAM KETAHANAN PANGAN DESA KEPADA ANAK YATIM, PIATU DAN YATIM-PIATU DESA DARMASABA
                </Text>
                <Text size="md" lineClamp={3}>
                Pada hari Selasa, 19 November 2024, Desa Darmasaba memberikan hasil panen jagung sebagai bagian dari kegiatan Ketahanan Pangan Desa kepada anak-anak yatim, piatu, dan yatim-piatu yang berusia 0-18 Tahun. Hasil panen ini diserahkan langsung oleh I. B. Surya Prabhawa Manuaba, S.H., M.H., NL.P selaku Perbekel Darmasaba, didampingi Ketua BPD dan LPM Desa Darmasaba, serta seluruh perangkat dan staf desa. Melalui kegiatan ini, kami berharap dapat memberikan manfaat langsung bagi mereka yang membutuhkan, serta memperkuat rasa kebersamaan dan kepedulian dalam membangun ketahanan pangan di Desa Darmasaba.
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
                    src="/api/img/beritapemerintahan-2.jpeg"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={300}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Pemerintahan</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                  Evaluasi dan Verifikasi APBDes Darmasaba T.A. 2025
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
                    src="/api/img/pemerintahan-3.jpg"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={250}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Pemerintahan</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                    JAKSA GARDA DESA (JAGA DESA) T.A. 2025
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
                      <Text size="sm">Pemerintahan</Text>
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

export default Pemerintahan;
