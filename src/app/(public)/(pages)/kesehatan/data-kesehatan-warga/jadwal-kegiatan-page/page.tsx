'use client'
import jadwalkegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Button, Card, Divider, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconChevronRight, IconClockHour4, IconMapPin } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function JadwalKegiatanPage() {
  const state = useProxy(jadwalkegiatanState);
  const router = useRouter();

  useShallowEffect(() => {
    state.findMany.load();
  }, []);

  if (!state.findMany.data) {
    return (
      <Box py="lg">
        <Skeleton h={500} radius="lg" />
      </Box>
    );
  }

  return (
    <Box>
      <Paper bg={colors['white-trans-1']} p="xl" radius="xl" shadow="md" h="auto" mih="100vh">
        <Stack gap="lg">
          <Title ta="center" order={1} c={colors['blue-button']} fw={700}>
            Jadwal Kegiatan Warga
          </Title>
          <Divider size="sm" color={colors['blue-button']} />
          {state.findMany.data.length === 0 ? (
            <Box py="xl" ta="center">
              <Text fz={{ base: 'sm', sm: 'md' }} c="dimmed">
                Belum ada jadwal kegiatan yang tersedia
              </Text>
            </Box>
          ) : (
            state.findMany.data.map((item) => (
              <Card
                key={item.id}
                withBorder
                radius="xl"
                shadow="sm"
                p="lg"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <Stack gap="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <Title order={2} c={colors['blue-button']} fw={700} fz={{ base: 'md', sm: 'xl' }}>
                      {item.informasijadwalkegiatan.name}
                    </Title>
                    <Text fw={600} fz={{ base: 'xs', sm: 'sm' }} c={colors['blue-button']} lh="1.4">
                      {new Date(item.informasijadwalkegiatan.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </Group>

                  <Group gap="xs">
                    <IconClockHour4 size={18} />
                    <Text fz={{ base: 'xs', sm: 'sm' }} lh="1.5">
                      {item.informasijadwalkegiatan.waktu}
                    </Text>
                  </Group>

                  <Group gap="xs">
                    <IconMapPin size={18} />
                    <Text fz={{ base: 'xs', sm: 'sm' }} lh="1.5">
                      {item.informasijadwalkegiatan.lokasi}
                    </Text>
                  </Group>

                  <Divider my="sm" />

                  <Group justify="flex-start">
                    <Button
                      bg={colors['blue-button']}
                      radius="lg"
                      size="sm"
                      rightSection={<IconChevronRight size={18} />}
                      onClick={() =>
                        router.push(
                          `/kesehatan/data-kesehatan-warga/jadwal-kegiatan-page/${item.id}`
                        )
                      }
                    >
                      Lihat Detail & Daftar
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default JadwalKegiatanPage;