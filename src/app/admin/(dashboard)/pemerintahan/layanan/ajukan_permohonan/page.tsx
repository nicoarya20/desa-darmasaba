/* eslint-disable react-hooks/exhaustive-deps */
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
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateLayananDesa from '../../../_state/desa/layananDesa';
import { useDebouncedValue } from '@mantine/hooks';

function AjukanPermohonan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pelayanan Ajukan Permohonan'
        placeholder='Cari nama atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAjukanPermohonan search={search} />
    </Box>
  );
}

function ListAjukanPermohonan({ search }: { search: string }) {
  const AjukanPermohonanState = useProxy(stateLayananDesa.ajukanPermohonan);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = AjukanPermohonanState.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  // Loading state
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
        <Title order={2} lh={1.2} mb={{ base: 'md', md: 'lg' }}>
          List Ajukan Permohonan
        </Title>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} miw={0}>
            <TableThead>
              <TableTr>
                <TableTh fz="sm" fw={600} lh={1.4}>Nama</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>Alamat</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>NIK</TableTh>
                <TableTh fz="sm" fw={600} lh={1.4}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.alamat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.nik}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/pemerintahan/layanan/ajukan_permohonan/${item.id}`)
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
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data ajukan permohonan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Box hiddenFrom="md">
          <Stack gap="md">
            {data.length > 0 ? (
              data.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="md" shadow="xs">
                  <Stack gap={'xs'}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{item.nama}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Alamat</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{item.alamat}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>NIK</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{item.nik}</Text>
                    </Box>
                    <Box>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/pemerintahan/layanan/ajukan_permohonan/${item.id}`)
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
              <Center py="xl">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data ajukan permohonan yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

        <Center mt="md">
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10, search);
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

export default AjukanPermohonan;