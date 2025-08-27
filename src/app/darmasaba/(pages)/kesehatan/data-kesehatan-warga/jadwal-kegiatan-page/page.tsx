'use client'
import jadwalkegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Button, Card, Divider, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
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
      <Paper p="xl" bg={colors['white-trans-1']} radius="xl" shadow="md" h="auto" mih="100vh">
        <Stack gap="lg">
          <Text ta="center" fw={700} fz="32px" c={colors['blue-button']}>
            Jadwal Kegiatan Warga
          </Text>

          {state.findMany.data.length === 0 ? (
            <Box py="xl" ta="center">
              <Text fz="lg" c="dimmed">
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
                  <Group justify="space-between">
                    <Text fw={700} fz="xl">
                      {item.informasijadwalkegiatan.name}
                    </Text>
                    <Text fw={600} fz="sm" c={colors['blue-button']}>
                      {item.informasijadwalkegiatan.tanggal}
                    </Text>
                  </Group>

                  <Group gap="xs">
                    <IconClockHour4 size={18} color={colors['blue-button']} />
                    <Text fz="sm">{item.informasijadwalkegiatan.waktu}</Text>
                  </Group>

                  <Group gap="xs">
                    <IconMapPin size={18} color={colors['blue-button']} />
                    <Text fz="sm">{item.informasijadwalkegiatan.lokasi}</Text>
                  </Group>

                  <Divider my="sm" />

                  <Group justify="flex-end">
                    <Button
                      variant="light"
                      radius="lg"
                      size="sm"
                      rightSection={<IconChevronRight size={18} />}
                      onClick={() =>
                        router.push(
                          `/darmasaba/kesehatan/data-kesehatan-warga/jadwal-kegiatan-page/${item.id}`
                        )
                      }
                      styles={{
                        root: {
                          background: colors['blue-button'],
                          color: 'white',
                          boxShadow: '0 0 12px rgba(0, 123, 255, 0.4)',
                          transition: 'all 0.2s ease',
                        },
                      }}
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
