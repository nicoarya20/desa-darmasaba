'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { useState } from 'react';
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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = keteranganState.findMany;

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
      <Paper bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Bank Sampah Terdekat</Title>
          <Tooltip label="Tambah Bank Sampah" withArrow>
            <Button 
              leftSection={<IconPlus size={18} />} 
              color="blue" 
              variant="light" 
              onClick={() => router.push('/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama Bank Sampah</TableTh>
                <TableTh>Alamat</TableTh>
                <TableTh>Nama Tempat di Maps</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500}>{item.name}</Text>
                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <Text lineClamp={2} truncate="end" fz="sm">
                          {item.alamat || '-'}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm">
                        {item.namaTempatMaps || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Tooltip label="Lihat Detail" withArrow>
                        <Button
                          variant="light"
                          color="blue"
                          onClick={() => router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/${item.id}`)}
                        >
                          <IconDeviceImac size={20} />
                        </Button>
                      </Tooltip>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4} align="center" py="xl">
                    <Text c="dimmed">Tidak ada data bank sampah terdekat</Text>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {totalPages > 1 && (
          <Center mt="xl">
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)}
              total={totalPages}
              siblings={1}
              boundaries={1}
              withEdges
            />
          </Center>
        )}
      </Paper>
    </Box>
  );
}

export default KeteranganBankSampahTerdekat;
