import colors from '@/con/colors';
import { Stack, Box, Container, Text, Paper, Group } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';
import { IconCalendar, IconClock, IconMapPin } from '@tabler/icons-react';

const dataPengumuman = [
  {
    id: 1,
    judul: 'Pendaftaran Bimbingan Belajar Gratis untuk Pelajar',
    tanggal: 'Sabtu, 20 April 2025',
    jam: '08:00 WITA',
    lokasi: 'Balai Banjar Desa Darmasaba',
    deskripsi: 'Dalam rangka meningkatkan kesadaran kesehatan, Pemerintah Desa Darmasaba bekerja sama dengan Puskesmas Abiansemal akan mengadakan pemeriksaan kesehatan gratis meliputi cek tekanan darah, kolesterol, gula darah, dan konsultasi gizi.'
  },
  {
    id: 2,
    judul: 'Lomba Video Pendek Hari Lingkungan',
    tanggal: 'Deadline: 28 April 2025',
    jam: '08:00 WITA',
    lokasi: 'Online Submission',
    deskripsi: 'Karang Taruna Desa mengadakan lomba video pendek bertema "Lingkunganku, Tanggung Jawabku". Pemenang akan diumumkan saat acara Hari Desa Hijau. Total hadiah Rp1.000.000.'
  },
  {
    id: 3,
    judul: 'Pendaftaran Bimbingan Belajar Gratis untuk Pelajar',
    tanggal: 'Sabtu, 20 April 2025',
    jam: '08:00 WITA',
    lokasi: 'Balai Banjar Desa Darmasaba',
    deskripsi: 'Dalam rangka meningkatkan kesadaran kesehatan, Pemerintah Desa Darmasaba bekerja sama dengan Puskesmas Abiansemal akan mengadakan pemeriksaan kesehatan gratis meliputi cek tekanan darah, kolesterol, gula darah, dan konsultasi gizi.'
  },
  {
    id: 4,
    judul: 'Lomba Video Pendek Hari Lingkungan',
    tanggal: 'Deadline: 28 April 2025',
    jam: '08:00 WITA',
    lokasi: 'Online Submission',
    deskripsi: 'Karang Taruna Desa mengadakan lomba video pendek bertema "Lingkunganku, Tanggung Jawabku". Pemenang akan diumumkan saat acara Hari Desa Hijau. Total hadiah Rp1.000.000.'
  },
  {
    id: 5,
    judul: 'Pendaftaran Bimbingan Belajar Gratis untuk Pelajar',
    tanggal: 'Sabtu, 20 April 2025',
    jam: '08:00 WITA',
    lokasi: 'Balai Banjar Desa Darmasaba',
    deskripsi: 'Dalam rangka meningkatkan kesadaran kesehatan, Pemerintah Desa Darmasaba bekerja sama dengan Puskesmas Abiansemal akan mengadakan pemeriksaan kesehatan gratis meliputi cek tekanan darah, kolesterol, gula darah, dan konsultasi gizi.'
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
            Pengumuman Pendidikan & Kepemudaan
          </Text>
          <Text ta="center" px="md" pb={10}>
            Informasi dan pengumuman resmi terkait pengumuman pendidikan & kepemudaan
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
