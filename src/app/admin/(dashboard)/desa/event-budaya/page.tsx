/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import eventBudayaState from '@/app/admin/(dashboard)/_state/desa/eventBudaya';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconCalendarEvent, IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';

function EventBudayaPage() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Event Budaya"
        placeholder="Cari nama atau lokasi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
      />
      <ListEventBudaya search={search} />
    </Box>
  );
}

function ListEventBudaya({ search }: { search: string }) {
  const state = useProxy(eventBudayaState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const { data, page, totalPages, loading, load } = state.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton h={400} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="lg">
          <Title order={4}>List Event Budaya</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/desa/event-budaya/create')}
          >
            Tambah Event
          </Button>
        </Group>

        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover layout="fixed" withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh w="35%">Nama Event</TableTh>
                <TableTh w="20%">Tanggal</TableTh>
                <TableTh w="25%">Lokasi</TableTh>
                <TableTh w="20%">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableTr
                    key={item.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/admin/desa/event-budaya/${item.id}`)}
                  >
                    <TableTd>
                      <Group gap="xs">
                        <IconCalendarEvent size={16} color={colors['blue-button-5']} />
                        <Text fz="sm" fw={500} truncate="end" lineClamp={1}>
                          {item.nama}
                        </Text>
                      </Group>
                    </TableTd>
                    <TableTd>
                      <Badge variant="light" color="indigo">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed" truncate="end" lineClamp={1}>
                        {item.lokasi}
                      </Text>
                    </TableTd>
                    <TableTd onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="light"
                        color="blue"
                        fz="sm"
                        px="sm"
                        h={36}
                        onClick={() => router.push(`/admin/desa/event-budaya/${item.id}`)}
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml="xs">Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Text ta="center" c="dimmed" py="xl">
                      Belum ada data event budaya
                    </Text>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Stack hiddenFrom="md" gap="sm">
          {data.length > 0 ? (
            data.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Stack gap="xs">
                  <Text fz="sm" fw={600} lh={1.4} c="dimmed">Nama Event</Text>
                  <Group gap="xs" wrap="nowrap">
                    <IconCalendarEvent size={16} color={colors['blue-button-5']} style={{ flexShrink: 0 }} />
                    <Text fz="sm" fw={500} lh={1.45}>{item.nama}</Text>
                  </Group>

                  <Text fz="sm" fw={600} lh={1.4} c="dimmed" mt="xs">Tanggal</Text>
                  <Box>
                    <Badge variant="light" color="indigo">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Badge>
                  </Box>

                  <Text fz="sm" fw={600} lh={1.4} c="dimmed" mt="xs">Lokasi</Text>
                  <Text fz="sm" fw={500} lh={1.45}>{item.lokasi || '-'}</Text>

                  <Button
                    variant="light"
                    color="blue"
                    fullWidth
                    mt="sm"
                    fz="sm"
                    h={36}
                    onClick={() => router.push(`/admin/desa/event-budaya/${item.id}`)}
                  >
                    <IconDeviceImacCog size={18} />
                    <Text ml="xs">Detail</Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Text ta="center" c="dimmed" py="xl" fz="sm">
              Belum ada data event budaya
            </Text>
          )}
        </Stack>

        {totalPages > 1 && (
          <Group justify="center" mt="lg">
            <Pagination
              total={totalPages}
              value={page}
              onChange={(p) => load(p, 10, search)}
            />
          </Group>
        )}
      </Paper>
    </Box>
  );
}

export default EventBudayaPage;
