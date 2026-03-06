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
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import infoTeknoState from '../../_state/inovasi/info-tekno';

function InfoTeknologiTepatGuna() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Info Teknologi Tepat Guna"
        placeholder="Cari info teknologi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListInfoTeknologiTepatGuna search={search} />
    </Box>
  );
}

function ListInfoTeknologiTepatGuna({ search }: { search: string }) {
  const state = useProxy(infoTeknoState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'lg' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>
            Daftar Info Teknologi Tepat Guna
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/inovasi/info-teknologi-tepat-guna/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nama Info Teknologi
                  </Text>
                </TableTh>
                <TableTh style={{ width: '50%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Deskripsi Singkat
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Aksi
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text
                        fz="sm"
                        lh={1.5}
                        c="dimmed"
                        lineClamp={1}
                        truncate
                        dangerouslySetInnerHTML={{
                          __html: item.deskripsi || '-',
                        }}
                      />
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImac size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/inovasi/info-teknologi-tepat-guna/${item.id}`,
                          )
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text fz="sm" c="dimmed" ta="center">
                        Tidak ada data Info Teknologi yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="xs">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="md">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz={"sm"} fw={600} lh={1.4}>
                      Nama Info Teknologi
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz={"sm"} fw={600} lh={1.4}>
                      Deskripsi Singkat
                    </Text>
                   <Box pl={5}>
                     <Text
                      fz="sm"
                      fw={500}
                      lh={1.4}
                      dangerouslySetInnerHTML={{
                        __html: item.deskripsi || '-',
                      }}
                    />
                   </Box>
                  </Box>
                  <Group justify="flex-end">
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImac size={16} />}
                      onClick={() =>
                        router.push(
                          `/admin/inovasi/info-teknologi-tepat-guna/${item.id}`,
                        )
                      }
                    >
                      Detail
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={20}>
              <Text fz="sm" c="dimmed" ta="center">
                Tidak ada data Info Teknologi yang cocok
              </Text>
            </Center>
          )}
        </Stack>
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

export default InfoTeknologiTepatGuna;