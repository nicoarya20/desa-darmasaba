'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import jadwalKegiatanState from '../../../_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';

function JadwalKegiatan() {
  return (
    <Box>
      <HeaderSearch
        title='Jadwal Kegiatan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListJadwalKegiatan/>
    </Box>
  );
}

function ListJadwalKegiatan() {
  const stateJadwalKegiatan = useProxy(jadwalKegiatanState)
  const router = useRouter();

  useShallowEffect(() => {
    stateJadwalKegiatan.findMany.load()
  }, [])

  if (!stateJadwalKegiatan.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500}/>
      </Box>
    )
  }
  return (
    <Box py={10}>
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack>
        <JudulList
          title='List Jadwal Kegiatan'
          href='/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan/create'
        />
        <Box style={{ overflowX: "auto" }}>
          <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Tanggal</TableTh>
                <TableTh>Waktu</TableTh>
                <TableTh>Lokasi</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {stateJadwalKegiatan.findMany.data?.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.informasijadwalkegiatan.name}</TableTd>
                  <TableTd>{item.informasijadwalkegiatan.tanggal}</TableTd>
                  <TableTd>{item.informasijadwalkegiatan.waktu}</TableTd>
                  <TableTd>{item.informasijadwalkegiatan.lokasi}</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan/${item.id}`)}>
                      <IconDeviceImacCog size={25} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>
      </Stack>
    </Paper>
  </Box>
  )
}

export default JadwalKegiatan;
