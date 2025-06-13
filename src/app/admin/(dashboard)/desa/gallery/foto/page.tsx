'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import JudulListTab from '../../../_com/jusulListTab';
import { useProxy } from 'valtio/utils';
import stateGallery from '../../../_state/desa/gallery';
import { useShallowEffect } from '@mantine/hooks';

function Foto() {
  const fotoState = useProxy(stateGallery.foto)
  const router = useRouter();

  useShallowEffect(() => {
    fotoState.findMany.load()
  }, [])

  if (!fotoState.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }
  
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulListTab
          title='List Foto'
          href='/admin/desa/gallery/foto/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={16} />}
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Judul Foto</TableTh>
              <TableTh>Tanggal Foto</TableTh>
              <TableTh>Deskripsi Foto</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {fotoState.findMany.data?.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>{new Date(item.createdAt).toDateString()}</TableTd>
                <TableTd>
                  <Text dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/desa/gallery/foto/${item.id}`)}>
                    <IconDeviceImac size={20} />
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

export default Foto;
