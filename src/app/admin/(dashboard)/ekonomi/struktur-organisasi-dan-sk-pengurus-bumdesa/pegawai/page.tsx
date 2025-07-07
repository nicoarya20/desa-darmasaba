'use client'
import colors from '@/con/colors';
import { Badge, Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import strukturorganisasiState from '../../../_state/ekonomi/struktur-organisasi/struktur-organisasi';

function Pegawai() {
  return (
    <Box>
      <HeaderSearch
        title='Pegawai'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPegawai />
    </Box>
  );
}

function ListPegawai() {
  const stateOrganisasi = useProxy(strukturorganisasiState.pegawai);
  const router = useRouter();

  useShallowEffect(() => {
    const loadData = async () => {
      console.log('1. Starting to load pegawai data...');
      try {
        // Clear existing data to ensure we see the loading state
        stateOrganisasi.findMany.data = [];

        // Load new data
        await stateOrganisasi.findMany.load();

        // Log the raw response and state
        console.log('2. Raw API response:', stateOrganisasi.findMany.data);

        // Type guard to ensure data is an array
        const data = stateOrganisasi.findMany.data || [];
        console.log(`3. Loaded ${data.length} pegawai records`);
        if (data.length > 0) {
          console.log('4. First record sample:', data[0]);
        }
      } catch (error) {
        console.error('Error loading pegawai data:', error);
        stateOrganisasi.findMany.data = [];
      }
    };

    loadData();

    // Cleanup function
    return () => {
      console.log('Cleanup: Unmounting component');
    };
  }, []);

  // Log render cycle
  console.log('Rendering with data:', stateOrganisasi.findMany.data);

  // Handle loading state
  if (stateOrganisasi.findMany.data === null) {
    console.log('Showing loading state');
    return (
      <Stack py={10}>
        <Skeleton height={300} />
      </Stack>
    );
  }

  // Check if data is an empty array
  const data = stateOrganisasi.findMany.data || [];
  if (data.length === 0) {
    console.log('No data available to display');
    return (
      <Box py={10}>
        <Paper p="md" ta="center">
          <p>Tidak ada data pegawai yang tersedia</p>
        </Paper>
      </Box>
    );
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Pegawai'
          href='/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/pegawai/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Gelar Akademik</TableTh>
              <TableTh>Telepon</TableTh>
              <TableTh>Posisi</TableTh>
              <TableTh>Aktif</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {(() => {
              console.log('Rendering table with items:', stateOrganisasi.findMany.data);
              return null;
            })()}
            {([...stateOrganisasi.findMany.data || []]
              .sort((a, b) => {
                if (a.isActive === b.isActive) {
                  return a.namaLengkap.localeCompare(b.namaLengkap); // kalau status sama, urut nama
                }
                return Number(b.isActive) - Number(a.isActive); // aktif duluan
              }) // Aktif di atas
            ).map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.namaLengkap}</TableTd>
                <TableTd>{item.gelarAkademik}</TableTd>
                <TableTd>{item.telepon}</TableTd>
                <TableTd>{item.posisi?.nama}</TableTd>
                <TableTd>
                  <Badge color={item.isActive ? "green" : "red"}>{item.isActive ? "Aktif" : "Tidak Aktif"}</Badge>
                </TableTd>
                <TableTd>
                  <Button bg={"green"} onClick={() => router.push(`/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/pegawai/${item.id}`)}>
                    <IconDeviceImacCog size={25} />
                  </Button>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Paper>
    </Box>
  );
}

export default Pegawai;
