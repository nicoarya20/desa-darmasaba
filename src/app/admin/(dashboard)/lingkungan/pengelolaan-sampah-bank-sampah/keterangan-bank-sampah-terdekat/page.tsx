'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import pengelolaanSampahState from '../../../_state/lingkungan/pengelolaan-sampah';

function KeteranganBankSampahTerdekat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Keterangan Bank Sampah Terdekat'
        placeholder='Cari nama bank sampah...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKeteranganBankSampahTerdekat search={search} />
    </Box>
  );
}

function ListKeteranganBankSampahTerdekat({ search }: { search: string }) {
  const keteranganState = useProxy(pengelolaanSampahState.keteranganSampah);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = keteranganState.findMany;

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
      <Paper bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Bank Sampah Terdekat
          </Title>
          <Button 
            leftSection={<IconPlus size={18} />} 
            color="blue" 
            variant="light" 
            onClick={() => router.push('/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/create')}
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
                <TableTh style={{ width: '30%' }}>Nama Bank Sampah</TableTh>
                <TableTh style={{ width: '35%' }}>Alamat</TableTh>
                <TableTh style={{ width: '25%' }}>Nama Tempat di Maps</TableTh>
                <TableTh style={{ width: '10%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5} lineClamp={2}>
                        {item.alamat || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.5}>
                        {item.namaTempatMaps || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/${item.id}`)}
                        p="xs"
                      >
                        <IconDeviceImac size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4} ta="center" py="xl">
                    <Text c="dimmed" fz="sm" lh={1.4}>
                      Tidak ada data bank sampah terdekat
                    </Text>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card */}
        <Box hiddenFrom="md">
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} p="sm" radius="sm" withBorder>
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Bank Sampah
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Alamat
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.alamat || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Tempat di Maps
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.namaTempatMaps || '-'}
                      </Text>
                    </Box>
                    <Group justify="flex-end" mt="xs">
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/${item.id}`)}
                        p="xs"
                      >
                        <IconDeviceImac size={20} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="xl">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data bank sampah terdekat
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
          <Center mt={{ base: 'lg', md: 'xl' }}>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)}
              total={totalPages}
              siblings={1}
              boundaries={1}
              withEdges
            />
          </Center>
      </Paper>
    </Box>
  );
}

export default KeteranganBankSampahTerdekat;