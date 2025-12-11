'use client'
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { Badge, Box, Button, Card, Divider, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconChevronRight, IconClock, IconMapPin } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function FasilitasKesehatanPage() {
  const state = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
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
      <Paper bg={colors['white-trans-1']} p="xl" radius="xl" shadow="md" h="100%">
        <Stack gap="lg">
          <Title
            order={1}
            ta="center"
            fw={700}
            c={colors['blue-button']}
            style={{ lineHeight: '1.2' }}
          >
            Fasilitas Kesehatan
          </Title>
          <Divider size="sm" color={colors['blue-button']} />
          <Stack gap="lg">
            {state.findMany.data.length === 0 ? (
              <Box py="xl" ta="center">
                <Text size="lg" c="dimmed" lh="1.5">
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
                      <Title order={3} fw={700} c={colors['blue-button']} lh="1.3" />
                      <Badge color="blue" radius="sm" variant="light" size="xs">
                        Aktif
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <IconMapPin size={18} stroke={1.5} />
                      <Text size="sm" lh="1.5">
                        {item.informasiumum.alamat}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <IconClock size={18} stroke={1.5} />
                      <Text size="sm" lh="1.5">
                        {item.informasiumum.jamOperasional}
                      </Text>
                    </Group>
                    <Group justify="flex-start">
                      <Button
                        bg={colors['blue-button']}
                        radius="lg"
                        size="sm"
                        rightSection={<IconChevronRight size={18} />}
                        onClick={() =>
                          router.push(
                            `/darmasaba/kesehatan/data-kesehatan-warga/fasilitas-kesehatan-page/${item.id}`
                          )
                        }
                      >
                        Lihat Detail
                      </Button>
                    </Group>
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