'use client'
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { Anchor, Badge, Box, Card, Divider, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { IconMapPin, IconClock, IconArrowRight } from '@tabler/icons-react';

function FasilitasKesehatanPage() {
  const state = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const router = useRouter();

  useShallowEffect(() => {
    state.findMany.load();
  }, []);

  if (!state.findMany.data) {
    return (
      <Box py="xl" px="md">
        <Stack gap="md">
          <Skeleton height={80} radius="lg" />
          <Skeleton height={80} radius="lg" />
          <Skeleton height={80} radius="lg" />
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Paper bg={colors['white-trans-1']} p="xl" radius="xl" shadow="md" h="100%">
        <Stack gap="lg">
          <Text ta="center" fw={700} fz="32px" c={colors['blue-button']}>
            Fasilitas Kesehatan
          </Text>
          <Divider size="sm" color={colors['blue-button']} />
          <Stack gap="lg">
          {state.findMany.data.length === 0 ? (
            <Box py="xl" ta="center">
              <Text fz="lg" c="dimmed">
                Belum ada fasilitas kesehatan yang tersedia
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
                style={{
                  background: 'linear-gradient(135deg, #fdfdfd, #f7faff)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
              >
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text fw={700} fz="lg" c={colors['blue-button']}>
                      {item.name}
                    </Text>
                    <Badge color="blue" radius="sm" variant="light" fz="xs">
                      Aktif
                    </Badge>
                  </Group>
                  <Group gap="xs">
                    <IconMapPin size={18} stroke={1.5} color={colors['blue-button']} />
                    <Text fz="sm" c="dimmed">
                      {item.informasiumum.alamat}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <IconClock size={18} stroke={1.5} color={colors['blue-button']} />
                    <Text fz="sm" c="dimmed">
                      {item.informasiumum.jamOperasional}
                    </Text>
                  </Group>
                  <Anchor
                    onClick={() =>
                      router.push(
                        `/darmasaba/kesehatan/data-kesehatan-warga/fasilitas-kesehatan-page/${item.id}`
                      )
                    }
                    c={colors['blue-button']}
                    fz="sm"
                    fw={600}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Lihat Detail
                    <IconArrowRight size={16} stroke={1.5} />
                  </Anchor>
                </Stack>
              </Card>
            ))
          )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default FasilitasKesehatanPage;
