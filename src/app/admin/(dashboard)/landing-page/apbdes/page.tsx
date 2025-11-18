'use client';
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
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconFile, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import apbdes from '../../_state/landing-page/apbdes';

function APBDes() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="APBDes"
        placeholder="Cari APBDes..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAPBDes search={search} />
    </Box>
  );
}

function ListAPBDes({ search }: { search: string }) {
  const listState = useProxy(apbdes);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = listState.findMany;

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
          <Title order={4}>Daftar APBDes</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/landing-page/apbdes/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>APBDes</TableTh>
                <TableTh style={{ width: '25%' }}>Tahun</TableTh>
                <TableTh style={{ width: '25%' }}>Dokumen</TableTh>
                <TableTh style={{ width: '25%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%' }}>
                      <Text fw={500} lineClamp={1}>
                        APBDes {item.tahun}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '25%' }}>
                      <Text fw={500}>{item.tahun || '-'}</Text>
                    </TableTd>
                    <TableTd style={{ width: '25%' }}>
                      {item.file?.link ? (
                        <Button
                          component="a"
                          href={item.file.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="light"
                          leftSection={<IconFile size={16} />}
                          size="xs"
                          radius="sm"
                        >
                          Lihat Dokumen
                        </Button>
                      ) : (
                        <Text c="dimmed" fz="sm">
                          Tidak ada dokumen
                        </Text>
                      )}
                    </TableTd>
                    <TableTd style={{ width: '25%' }}>
                      <Box w={100}>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={14} />}
                          onClick={() => router.push(`/admin/landing-page/apbdes/${item.id}`)}
                          fullWidth
                        >
                          Detail
                        </Button>
                      </Box>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data APBDes yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>

      <Center mt="md">
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default APBDes;