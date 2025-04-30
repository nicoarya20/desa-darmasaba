import colors from '@/con/colors';
import { Stack, Box, Container, Text, Paper, Group } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';
import { IconCalendar, IconClock, IconMapPin } from '@tabler/icons-react';

const dataPengumuman = [
  {
    id: 1,
    judul: 'Pelatihan Digital Marketing untuk UMKM Desa',
    tanggal: 'Rabu, 23 April 2025',
    jam: '13:00 WITA',
    lokasi: 'Aula Kantor Desa',
    deskripsi: 'Para pelaku UMKM diundang untuk mengikuti pelatihan dasar digital marketing: mulai dari membuat akun bisnis, copywriting produk, hingga promosi melalui media sosial. Peserta akan mendapat sertifikat dan materi pelatihan.'
  },
  {
    id: 2,
    judul: 'Pelatihan Digital Marketing untuk UMKM Desa',
    tanggal: 'Rabu, 23 April 2025',
    jam: '13:00 WITA',
    lokasi: 'Aula Kantor Desa',
    deskripsi: 'Para pelaku UMKM diundang untuk mengikuti pelatihan dasar digital marketing: mulai dari membuat akun bisnis, copywriting produk, hingga promosi melalui media sosial. Peserta akan mendapat sertifikat dan materi pelatihan.'
  },
  {
    id: 3,
    judul: 'Pelatihan Digital Marketing untuk UMKM Desa',
    tanggal: 'Rabu, 23 April 2025',
    jam: '13:00 WITA',
    lokasi: 'Aula Kantor Desa',
    deskripsi: 'Para pelaku UMKM diundang untuk mengikuti pelatihan dasar digital marketing: mulai dari membuat akun bisnis, copywriting produk, hingga promosi melalui media sosial. Peserta akan mendapat sertifikat dan materi pelatihan.'
  },
  {
    id: 4,
    judul: 'Pelatihan Digital Marketing untuk UMKM Desa',
    tanggal: 'Rabu, 23 April 2025',
    jam: '13:00 WITA',
    lokasi: 'Aula Kantor Desa',
    deskripsi: 'Para pelaku UMKM diundang untuk mengikuti pelatihan dasar digital marketing: mulai dari membuat akun bisnis, copywriting produk, hingga promosi melalui media sosial. Peserta akan mendapat sertifikat dan materi pelatihan.'
  },
  {
    id: 5,
    judul: 'Pelatihan Digital Marketing untuk UMKM Desa',
    tanggal: 'Rabu, 23 April 2025',
    jam: '13:00 WITA',
    lokasi: 'Aula Kantor Desa',
    deskripsi: 'Para pelaku UMKM diundang untuk mengikuti pelatihan dasar digital marketing: mulai dari membuat akun bisnis, copywriting produk, hingga promosi melalui media sosial. Peserta akan mendapat sertifikat dan materi pelatihan.'
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
            Pengumuman Ekonomi & UMKM
          </Text>
          <Text ta="center" px="md" pb={10}>
            Informasi dan pengumuman resmi terkait pengumuman ekonomi & umkm
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
