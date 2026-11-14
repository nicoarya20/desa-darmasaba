'use client'
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { Button, Container, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconChalkboard, IconMicroscope, IconRefresh, IconSchool } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useEffect, useState } from 'react';
import { InfoSekolahStatCard, type InfoSekolahStat } from './_com/InfoSekolahStatCard';
import { INFO_SEKOLAH_PATH } from './_com/info-sekolah.logic';

type Totals = { lembaga: number; siswa: number; pengajar: number };

/** Ringkasan total (semua jenjang) → tabel; menyaring per jenjang dilakukan di tabel masing-masing. */
export default function SekolahPage() {
  const router = useTransitionRouter();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [failed, setFailed] = useState(false);

  const loadData = useCallback(async () => {
    setTotals(null);
    setFailed(false);
    const { lembagaPendidikan, siswa, pengajar } = infoSekolahPaud;
    try {
      // limit 1: hanya `total` yang dibutuhkan kartu.
      await Promise.all([lembagaPendidikan, siswa, pengajar].map((s) => s.findMany.load(1, 1, '')));
      setTotals({ lembaga: lembagaPendidikan.findMany.total, siswa: siswa.findMany.total, pengajar: pengajar.findMany.total });
    } catch (error) {
      console.error('Gagal memuat ringkasan Info Sekolah:', error);
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats: InfoSekolahStat[] = [
    {
      icon: IconChalkboard,
      jumlah: totals?.lembaga ?? 0,
      nama: 'Lembaga Pendidikan',
      helper: 'Jumlah institusi pendidikan resmi di wilayah ini',
      href: `${INFO_SEKOLAH_PATH}/lembaga`,
    },
    {
      icon: IconSchool,
      jumlah: totals?.siswa ?? 0,
      nama: 'Siswa Terdaftar',
      helper: 'Total siswa aktif di semua jenjang',
      href: `${INFO_SEKOLAH_PATH}/siswa`,
    },
    {
      icon: IconMicroscope,
      jumlah: totals?.pengajar ?? 0,
      nama: 'Tenaga Pengajar',
      helper: 'Jumlah guru dan staf pengajar aktif',
      href: `${INFO_SEKOLAH_PATH}/pengajar`,
    },
  ];
  const loading = totals === null && !failed;

  return (
    <Stack gap="lg">
      <Paper radius="lg" p="xl" withBorder>
        <Stack gap="md">
          <Text ta="center" fw={800} fz={28}>Cari Informasi Sekolah</Text>
          <Text ta="center" fz="md" c="black">
            Temukan data lengkap mengenai lembaga pendidikan, jumlah siswa terdaftar, dan tenaga pengajar
            di semua jenjang pendidikan. Buka salah satu kartu di bawah, lalu saring berdasarkan jenjang
            (TK, SD, SMP, SMA, dan lainnya) langsung di tabelnya.
          </Text>
        </Stack>
      </Paper>

      <Paper radius="md" style={{ background: '#f8fafc', paddingBottom: 48 }}>
        <Container size="xl" py={{ base: 'md', md: 'xl' }}>
          <Group justify="start" mb="md">
            <Button
              leftSection={<IconRefresh color={colors['blue-button']} size={16} />}
              variant="outline"
              size="xs"
              onClick={() => void loadData()}
              loading={loading}
              c={colors['blue-button']}
              style={{ borderColor: colors['blue-button'] }}
            >
              Segarkan Data
            </Button>
          </Group>
          {failed && (
            <Text c="red" mb="md" role="alert">Data gagal dimuat. Coba “Segarkan Data”.</Text>
          )}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {stats.map((stat) => (
              <InfoSekolahStatCard key={stat.nama} stat={stat} loading={loading} onOpen={(href) => router.push(href)} />
            ))}
          </SimpleGrid>
        </Container>
      </Paper>
    </Stack>
  );
}
