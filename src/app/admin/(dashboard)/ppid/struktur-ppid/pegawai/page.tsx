/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Badge, Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, ThemeIcon } from '@mantine/core';
import { IconCheck, IconDeviceImacCog, IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import stateStrukturPPID from '../../../_state/ppid/struktur_ppid/struktur_PPID';

function PegawaiPPID() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pegawai PPID'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPegawaiPPID search={search} />
    </Box>
  );
}

function ListPegawaiPPID({ search }: { search: string }) {
  const stateOrganisasi = useProxy(stateStrukturPPID.pegawai);
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateOrganisasi.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || []

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={300} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
         <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Pegawai'
          href='/admin/ppid/struktur-ppid/pegawai/create'
        />
        <Box style={{ overflowX: "auto" }}>
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
          </Table>
        </Box>
      </Paper>
      </Box>
    );
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'} h={{base: 770, md: 650}}>
        <JudulList
          title='List Pegawai'
          href='/admin/ppid/struktur-ppid/pegawai/create'
        />
        <Box style={{ overflowX: "auto" }}>
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
              {([...filteredData]
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
                    <Group gap="xs" wrap="nowrap">
                      <Box visibleFrom="sm">
                        <Badge color={item.isActive ? "green" : "red"}>
                          {item.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </Box>
                      <Box hiddenFrom="sm">
                        {item.isActive ? (
                          <ThemeIcon color="green" variant="light" size="sm">
                            <IconCheck size={16} />
                          </ThemeIcon>
                        ) : (
                          <ThemeIcon color="red" variant="light" size="sm">
                            <IconX size={16} />
                          </ThemeIcon>
                        )}
                      </Box>
                    </Group>
                  </TableTd>
                  <TableTd>
                    <Button bg={"green"} onClick={() => router.push(`/admin/ppid/struktur-ppid/pegawai/${item.id}`)}>
                      <IconDeviceImacCog size={25} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
     <Center>
     <Pagination
        value={page}
        onChange={(newPage) => {
          load(newPage, 10);
          window.scrollTo(0, 0); 
        }}
        total={totalPages}
        mt="md"
        mb="md"
      />
     </Center>
    </Box>
  );
}

export default PegawaiPPID;
