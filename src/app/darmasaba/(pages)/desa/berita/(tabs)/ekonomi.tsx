import colors from '@/con/colors';
import { Box, Center, Container, Divider, Grid, GridCol, Group, Image, Pagination, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import React from 'react';

const dataBeritaTerbaru = [
  {
    id: 1,
    judul: 'PROGRAM KETAHANAN PANGAN PEMERINTAH DESA DARMASABA TAHUN 2023',
    image: "/api/img/ekonomi-sampingan-3.png",
    tanggal: "Selasa, 11 Januari 2025",
  },
  {
    id: 2,
    judul: 'Sinergitas Pemkab Badung-TNI Wujudkan Kedaulatan Pangan di Subak Aban Darmasaba',
    image: "/api/img/ekonomi-sampingan.png",
    tanggal: "Kamis, 13 Januari 2025",
  },
  {
    id: 3,
    judul: 'ANTUSIASME WARGA DARMASABA MELAKUKAN PEMBUKAAN REKENING BANK BPD BALI ',
    image: "/api/img/ekonomi-sampingan-2.png",
    tanggal: "Kamis, 13 Januari 2025",
  },
]
function Ekonomi() {
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
                    src="/api/img/ekonomi-utama.png"
                    alt="Darmasaba Smart Village"
                    radius="md"
                    fit="cover"
                    h={{ base: 450, md: 660 }}
                  />
                </Box>
                <Group>
                  <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                    <Text size="sm">Ekonomi</Text>
                  </Paper>
                </Group>
                <Text fz={{ base: "xl", md: "2xl" }} fw="bold" lineClamp={2}>
                PROGRAM KETAHANAN PANGAN PEMERINTAH DESA DARMASABA TAHUN 2023
                </Text>
                <Text size="md" lineClamp={2}>
                Pemerintah Desa Darmasaba melalui kegiatan ketahanan pangan ini menjalankan dua kategori yaitu pertanian dan peternakan untuk kategori pertanian telah membuahkan hasil panen pertama pada hari Kamis, 24 Agustus 2023 melakukan panen bawang merah di lokasi ketahanan pangan Br. Taman, Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung. Adapun varietas bawang yang dipanen adalah Bawang Bali Karet (Batu Ijo) pada lahan seluas kurang lebih 7 are.
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
                    src="/api/img/ekonomi-sampingan.png"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={180}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Ekonomi</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                  Sinergitas Pemkab Badung-TNI Wujudkan Kedaulatan Pangan di Subak Aban Darmasaba 
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
                    src="/api/img/ekonomi-sampingan-2.png"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={180}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Ekonomi</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={1}>
                  ANTUSIASME WARGA DARMASABA MELAKUKAN PEMBUKAAN REKENING BANK BPD BALI
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
                      <Text size="sm">Ekonomi</Text>
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

export default Ekonomi;
