'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import sdgsDesa from '../../_state/landing-page/sdgs-desa';


function SdgsDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='SDGs Desa'
        placeholder='Cari SDGs Desa...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListSdgsDesa search={search} />
    </Box>
  );
}

function ListSdgsDesa({ search }: { search: string }) {
  const listState = useProxy(sdgsDesa)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={550} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Daftar SDGs Desa</Title>
            <Tooltip label="Tambah SDGs Desa" withArrow>
              <Button 
                leftSection={<IconPlus size={18} />} 
                color={colors['blue-button']} 
                variant="light"
                onClick={() => router.push('/admin/landing-page/sdgs/create')}
              >
                Tambah Baru
              </Button>
            </Tooltip>
          </Group>
          <Box style={{ overflowX: 'auto' }}>
            <Table>
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '60%' }}>Nama SDGs Desa</TableTh>
                  <TableTh style={{ width: '20%' }}>Jumlah</TableTh>
                  <TableTh style={{ width: '20%', textAlign: 'center' }}>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                <TableTr>
                  <TableTd colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text c="dimmed">Tidak ada data SDGs Desa</Text>
                  </TableTd>
                </TableTr>
              </TableTbody>
            </Table>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar SDGs Desa</Title>
          <Tooltip label="Tambah SDGs Desa" withArrow>
            <Button 
              leftSection={<IconPlus size={18} />} 
              color={colors['blue-button']} 
              variant="light" 
              onClick={() => router.push('/admin/landing-page/sdgs/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '60%' }}>Nama SDGs Desa</TableTh>
                <TableTh style={{ width: '20%' }}>Jumlah</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd style={{ width: '60%' }}>
                    <Text fw={500} truncate="end" lineClamp={1}>
                      {item.name}
                    </Text>
                  </TableTd>
                  <TableTd style={{ width: '20%' }}>
                    <Text fz="sm" c="dimmed">
                      {item.jumlah || '0'}
                    </Text>
                  </TableTd>
                  <TableTd style={{ width: '20%', textAlign: 'center' }}>
                    <Tooltip label="Lihat Detail" withArrow>
                      <Button 
                        variant="light" 
                        color="blue" 
                        size="sm"
                        onClick={() => router.push(`/admin/landing-page/sdgs/${item.id}`)}
                      >
                        <IconDeviceImacCog size={18} />
                      </Button>
                    </Tooltip>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
      <Center mt="lg">
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo(0, 0);
          }}
          total={Math.max(1, totalPages)}
          withEdges
          radius="md"
        />
      </Center>
    </Box>
  )
}

export default SdgsDesa;
