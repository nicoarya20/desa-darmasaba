import colors from '@/con/colors';
import { Stack, Box, Container, Text, Paper, Group } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';
import { IconCalendar, IconClock, IconMapPin } from '@tabler/icons-react';

const dataPengumuman = [
  {
    id: 1,
    judul: 'Pelatihan Dasar Komputer untuk Lansia dan Ibu Rumah Tangga',
    tanggal: 'Selasa, 30 April 2025',
    jam: '09:00 WITA',
    lokasi: 'Perpustakaan Desa',
    deskripsi: 'Belajar dari nol: cara menyalakan komputer, menulis di Word, membuat email, dan dasar penggunaan HP Android untuk komunikasi dan akses layanan desa online. Terbuka untuk 20 peserta.'
  },
  {
    id: 2,
    judul: 'Pelatihan Dasar Komputer untuk Lansia dan Ibu Rumah Tangga',
    tanggal: 'Selasa, 30 April 2025',
    jam: '09:00 WITA',
    lokasi: 'Perpustakaan Desa',
    deskripsi: 'Belajar dari nol: cara menyalakan komputer, menulis di Word, membuat email, dan dasar penggunaan HP Android untuk komunikasi dan akses layanan desa online. Terbuka untuk 20 peserta.'
  },
  {
    id: 3,
    judul: 'Pelatihan Dasar Komputer untuk Lansia dan Ibu Rumah Tangga',
    tanggal: 'Selasa, 30 April 2025',
    jam: '09:00 WITA',
    lokasi: 'Perpustakaan Desa',
    deskripsi: 'Belajar dari nol: cara menyalakan komputer, menulis di Word, membuat email, dan dasar penggunaan HP Android untuk komunikasi dan akses layanan desa online. Terbuka untuk 20 peserta.'
  },
  {
    id: 4,
    judul: 'Pelatihan Dasar Komputer untuk Lansia dan Ibu Rumah Tangga',
    tanggal: 'Selasa, 30 April 2025',
    jam: '09:00 WITA',
    lokasi: 'Perpustakaan Desa',
    deskripsi: 'Belajar dari nol: cara menyalakan komputer, menulis di Word, membuat email, dan dasar penggunaan HP Android untuk komunikasi dan akses layanan desa online. Terbuka untuk 20 peserta.'
  },
  {
    id: 5,
    judul: 'Pelatihan Dasar Komputer untuk Lansia dan Ibu Rumah Tangga',
    tanggal: 'Selasa, 30 April 2025',
    jam: '09:00 WITA',
    lokasi: 'Perpustakaan Desa',
    deskripsi: 'Belajar dari nol: cara menyalakan komputer, menulis di Word, membuat email, dan dasar penggunaan HP Android untuk komunikasi dan akses layanan desa online. Terbuka untuk 20 peserta.'
  },
]
function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md" >
        <Stack align="center" gap="0" >
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Pengumuman Digitalisasi Desa
          </Text>
          <Text ta="center" px="md" pb={10}>
            Informasi dan pengumuman resmi terkait pengumuman digitalisasi desa
          </Text>
        </Stack>
      </Container>
      <Box px={{ base: 'md', md: 100 }}>
        {dataPengumuman.map((v, k) => {
          return (
            <Paper mb={10} key={k} withBorder p="lg" radius="md" shadow="md" bg={colors["white-1"]}>
              <Text fz={'h3'}>{v.judul}</Text>
              <Group style={{ color: 'black' }} pb={20}>
                <Group gap="xs">
                  <IconCalendar size={18} />
                  <Text size="sm">{v.tanggal}</Text>
                </Group>
                <Group gap="xs">
                  <IconClock size={18} />
                  <Text size="sm">{v.jam}</Text>
                </Group>
                <Group gap="xs">
                  <IconMapPin size={18} />
                  <Text size="sm">{v.lokasi}</Text>
                </Group>
              </Group>
              <Text ta={'justify'}>
                {v.deskripsi}
              </Text>
            </Paper>
          )
        })}
      </Box>
    </Stack>
  );
}

export default Page;
