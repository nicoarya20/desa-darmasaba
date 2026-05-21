'use client';
import eventBudayaState from '@/app/admin/(dashboard)/_state/desa/eventBudaya';
import colors from '@/con/colors';
import {
  Box,
  Center,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCalendarEvent, IconMapPin } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';

const LIMIT = 5;

function KalenderEventBudayaPage() {
  const state = useProxy(eventBudayaState);
  const { data, loading, page, totalPages } = state.findMany;

  useShallowEffect(() => {
    state.findMany.load(1, LIMIT);
  }, []);

  const handlePageChange = (p: number) => {
    state.findMany.load(p, LIMIT);
  };

  return (
    <Box px={{ base: 'md', md: 100 }} pb="xl">
      <Title order={2} mb="xl" c={colors['blue-button']}>
        Kalender Event Budaya
      </Title>

      {loading || !data ? (
        <Stack gap="md">
          {Array(LIMIT)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} h={80} radius="lg" />
            ))}
        </Stack>
      ) : data.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <IconCalendarEvent size={48} color={colors['blue-button-3']} />
            <Text c="dimmed" fz="sm">
              Belum ada event budaya.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          {data.map((item) => (
            <Paper
              key={item.id}
              withBorder
              p="lg"
              radius="lg"
              shadow="sm"
              style={{ borderLeft: `4px solid ${colors['blue-button-5']}` }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="sm" align="flex-start" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <IconCalendarEvent
                    size={22}
                    color={colors['blue-button-5']}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Stack gap={4} style={{ minWidth: 0 }}>
                    <Text fw={600} fz="md" lineClamp={2}>
                      {item.nama}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                    {item.deskripsi && (
                      <Text fz="sm" c="dimmed" lineClamp={2} mt={2}>
                        {item.deskripsi}
                      </Text>
                    )}
                  </Stack>
                </Group>

                <Group gap={4} style={{ flexShrink: 0 }} align="center">
                  <IconMapPin size={14} color={colors['grey']['2']} />
                  <Text fz="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {item.lokasi}
                  </Text>
                </Group>
              </Group>
            </Paper>
          ))}

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                total={totalPages}
                value={page}
                onChange={handlePageChange}
                color={colors['blue-button']}
                radius="md"
              />
            </Group>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default KalenderEventBudayaPage;
