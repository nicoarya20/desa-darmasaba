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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
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
    const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = listState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'md', md: 'lg' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'md', md: 'lg' }}>
      {/* Desktop Table */}
      <Box visibleFrom="md">
        <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={2} size="lg" lh={1.2}>
              Daftar APBDes
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/landing-page/apbdes/create')}
            >
              Tambah Baru
            </Button>
          </Group>

          <Box>
            <Table highlightOnHover miw={0}>
              <TableThead>
                <TableTr>
                  <TableTh fz="md" fw={600} ta="left" w="25%">
                    APBDes
                  </TableTh>
                  <TableTh fz="md" fw={600} ta="left" w="25%">
                    Tahun
                  </TableTh>
                  <TableTh fz="md" fw={600} ta="left" w="25%">
                    Dokumen
                  </TableTh>
                  <TableTh fz="md" fw={600} ta="left" w="25%">
                    Aksi
                  </TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd>
                        <Text fz="md" fw={500} lh={1.5} lineClamp={1}>
                          APBDes {item.tahun}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Text fz="md" fw={500} lh={1.5}>
                          {item.tahun || '-'}
                        </Text>
                      </TableTd>
                      <TableTd>
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
                            fz="sm"
                          >
                            Lihat Dokumen
                          </Button>
                        ) : (
                          <Text c="dimmed" fz="sm" lh={1.5}>
                            Tidak ada dokumen
                          </Text>
                        )}
                      </TableTd>
                      <TableTd>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={14} />}
                          onClick={() => router.push(`/admin/landing-page/apbdes/${item.id}`)}
                          fz="sm"
                        >
                          Detail
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))
                ) : (
                  <TableTr>
                    <TableTd colSpan={4}>
                      <Center py="lg">
                        <Text c="dimmed" fz="sm" lh={1.5}>
                          Tidak ada data APBDes yang cocok
                        </Text>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>
        </Paper>
      </Box>

      {/* Mobile Cards */}
      <Box hiddenFrom="md">
        <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={2} size="lg" lh={1.2}>
              Daftar APBDes
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/landing-page/apbdes/create')}
            >
              Tambah Baru
            </Button>
          </Group>
          <Stack gap="md">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper
                  key={item.id}
                  withBorder
                  bg={colors['white-1']}
                  p="md"
                  shadow="sm"
                  radius="md"
                >
                  <Stack gap="xs">
                    <Text fz="sm" fw={600} lh={1.4}>
                      APBDes {item.tahun}
                    </Text>
                    <Box>
                      <Text fz="sm"fw={600} lh={1.4}>
                        Tahun
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.tahun || '-'}
                      </Text>
                    </Box>

                    <Box>
                      <Text fz="sm"fw={600} lh={1.4}>
                        Dokumen
                      </Text>
                      {item.file?.link ? (
                        <Button
                          component="a"
                          href={item.file.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="light"
                          leftSection={<IconFile size={14} />}
                          size="xs"
                          radius="sm"
                          fz="xs"
                          lh={1.4}
                        >
                          Lihat
                        </Button>
                      ) : (
                        <Text fz="xs" c="dimmed" lh={1.4}>
                          Tidak ada
                        </Text>
                      )}
                    </Box>

                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={14} />}
                      onClick={() => router.push(`/admin/landing-page/apbdes/${item.id}`)}
                      mt="sm"
                      fz="xs"
                      lh={1.4}
                    >
                      Detail
                    </Button>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Paper withBorder bg={colors['white-1']} p="md" radius="md">
                <Center py="lg">
                  <Text c="dimmed" fz="xs" lh={1.4}>
                    Tidak ada data APBDes yang cocok
                  </Text>
                </Center>
              </Paper>
            )}
          </Stack>
        </Paper>
      </Box>

      <Center mt="xl">
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