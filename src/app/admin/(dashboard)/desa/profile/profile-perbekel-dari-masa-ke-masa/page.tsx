'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
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

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify='space-between' mb="md">
          <Title order={4}>List Perbekel Dari Masa Ke Masa</Title>
          <Tooltip label="Tambah Perbekel Baru" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/desa/profile/profile-perbekel-dari-masa-ke-masa/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '35%' }}>Nama Perbekel</TableTh>
                <TableTh style={{ width: '35%' }}>Periode</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} lineClamp={1}>{item.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Text lineClamp={1}>{item.periode}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/desa/profile/profile-perbekel-dari-masa-ke-masa/${item.id}`)}
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
                      <Text color="dimmed">Tidak ada data perbekel yang cocok</Text>
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

export default PerbekelDariMasaKeMasa;
