'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
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
  Tooltip
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import desaDigitalState from '../../_state/inovasi/desa-digital';

function DesaDigitalSmartVillage() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Desa Digital Smart Village"
        placeholder="Cari inovasi digital desa..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDesaDigitalSmartVillage search={search} />
    </Box>
  );
}

function ListDesaDigitalSmartVillage({ search }: { search: string }) {
  const state = useProxy(desaDigitalState);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>List Desa Digital Smart Village</Title>
          <Tooltip label="Tambah Inovasi" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/inovasi/desa-digital-smart-village/create')
              }
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Nama Inovasi</TableTh>
                <TableTh style={{ width: '50%' }}>
                  Deskripsi Singkat Inovasi
                </TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <Text
                          fz="sm"
                          c="dimmed"
                          lineClamp={1}
                          dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                        />
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/inovasi/desa-digital-smart-village/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data inovasi digital yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default DesaDigitalSmartVillage;
