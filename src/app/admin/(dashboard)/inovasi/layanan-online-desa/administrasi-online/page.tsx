'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
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
  Title
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import layananonlineDesa from '../../../_state/inovasi/layanan-online-desa';

function AdministrasiOnline() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Administrasi Online"
        placeholder="Cari nama layanan, alamat, atau nomor telepon..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAdministrasiOnline search={search} />
    </Box>
  );
}

function ListAdministrasiOnline({ search }: { search: string }) {
  const state = useProxy(layananonlineDesa.administrasiOnline);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Title order={4} lh={1.2} mb={{ base: 'md', md: 'lg' }}>
          Daftar Administrasi Online
        </Title>

        {/* Desktop Table */}
        <Box visibleFrom="md">
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
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>Alamat</Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>Nomor Telepon</Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>Aksi</Text>
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
                      <Text fz="sm" c="gray.7" lh={1.5} lineClamp={1}>
                        {item.alamat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="gray.7" lh={1.5} lineClamp={1}>
                        {item.nomorTelepon || '-'}
                      </Text>
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
                            `/admin/inovasi/layanan-online-desa/administrasi-online/${item.id}`
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
                  <TableTd colSpan={4}>
                    <Center py={24}>
                      <Text c="gray.6" fz="sm" lh={1.4}>
                        Tidak ada data administrasi online yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="md">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} p="md" withBorder>
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{item.name}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Alamat</Text>
                      <Text fz="sm" fw={500} c="gray.7" lh={1.5}>{item.alamat}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nomor Telepon</Text>
                      <Text fz="sm" fw={500} c="gray.7" lh={1.5}>{item.nomorTelepon || '-'}</Text>
                    </Box>
                    <Box>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImac size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/inovasi/layanan-online-desa/administrasi-online/${item.id}`
                          )
                        }
                        fullWidth
                      >
                        Detail
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={24}>
                <Text c="gray.6" fz="sm" lh={1.4}>
                  Tidak ada data administrasi online yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
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

export default AdministrasiOnline;
