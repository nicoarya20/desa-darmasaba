/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import eventBudayaState from '@/app/admin/(dashboard)/_state/desa/eventBudaya';
import colors from '@/con/colors';
import {
  ActionIcon,
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
import { IconCalendarEvent, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
        onChange={(e) => setSearch(e.currentTarget.value)}
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

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover layout="fixed" withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh w="30%">Nama Event</TableTh>
                <TableTh w="20%">Tanggal</TableTh>
                <TableTh w="25%">Lokasi</TableTh>
                <TableTh w="25%">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Group gap="xs">
                        <IconCalendarEvent size={16} color="blue" />
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
                    <TableTd>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() =>
                            router.push(`/admin/desa/event-budaya/${item.id}/edit`)
                          }
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          loading={state.delete.loading}
                          onClick={() => state.delete.byId(item.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
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
