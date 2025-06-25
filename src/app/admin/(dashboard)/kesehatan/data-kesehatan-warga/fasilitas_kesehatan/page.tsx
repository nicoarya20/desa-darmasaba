'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import fasilitasKesehatanState from '../../../_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';


function FasilitasKesehatan() {
  return (
    <Box>
      <HeaderSearch
        title='Fasilitas Kesehatan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListFasilitasKesehatan/>
    </Box>
  );
}

function ListFasilitasKesehatan() {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState)
  const router = useRouter();

  useShallowEffect(() => {
    stateFasilitasKesehatan.findMany.load()
  }, [])

  if (!stateFasilitasKesehatan.findMany.data) {
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
          title='List Fasilitas Kesehatan'
          href='/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/create'
        />
        <Box style={{ overflowX: "auto" }}>
          <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh>Fasilitas Kesehatan</TableTh>
                <TableTh>Alamat</TableTh>
                <TableTh>Jam Operasional</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {stateFasilitasKesehatan.findMany.data?.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.name}</TableTd>
                  <TableTd>{item.informasiumum.alamat}</TableTd>
                  <TableTd>{item.informasiumum.jamOperasional}</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${item.id}`)}>
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

export default FasilitasKesehatan;
