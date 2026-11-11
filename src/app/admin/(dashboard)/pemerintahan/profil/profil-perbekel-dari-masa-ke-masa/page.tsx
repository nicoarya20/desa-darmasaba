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
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateProfileDesa from '../../../_state/desa/profile';

function PerbekelDariMasaKeMasa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Perbekel Dari Masa Ke Masa'
        placeholder='Cari nama perbekel...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPerbekelDariMasaKeMasa search={search} />
    </Box>
  );
}

function ListPerbekelDariMasaKeMasa({ search }: { search: string }) {
  const state = useProxy(stateProfileDesa.mantanPerbekel)
  const router = useRouter();
  const { data, page, totalPages, loading, load } = state.findMany;
   const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay 

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify='space-between' mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            List Perbekel Dari Masa Ke Masa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/pemerintahan/profil/profil-perbekel-dari-masa-ke-masa/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} miw={0}>
            <TableThead>
              <TableTr>
                <TableTh fz="sm" fw={600} ta="left" c="dark.9">Nama Perbekel</TableTh>
                <TableTh fz="sm" fw={600} ta="left" c="dark.9">Periode</TableTh>
                <TableTh fz="sm" fw={600} ta="left" c="dark.9">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} lineClamp={1}>{item.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5} lineClamp={1}>{item.periode}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/pemerintahan/profil/profil-perbekel-dari-masa-ke-masa/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={{ base: 'md', md: 'lg' }}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data perbekel yang cocok
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
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={'xs'}>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4} c="dark.9">Nama Perbekel</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{item.nama}</Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4} c="dark.9">Periode</Text>
                      <Text fz="sm" lh={1.5}>{item.periode}</Text>
                    </Box>
                    <Box>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/pemerintahan/profil/profil-perbekel-dari-masa-ke-masa/${item.id}`)}
                        fullWidth
                      >
                        Detail
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="md">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data perbekel yang cocok
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
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt={{ base: 'sm', md: 'md' }}
          mb={{ base: 'sm', md: 'md' }}
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default PerbekelDariMasaKeMasa;