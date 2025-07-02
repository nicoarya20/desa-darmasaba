'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import pencegahanKriminalitasState from '../../_state/keamanan/pencegahan-kriminalitas';
import { useShallowEffect } from '@mantine/hooks';

function PencegahanKriminalitas() {
  return (
    <Box>
      <HeaderSearch
        title='Pencegahan Kriminalitas'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPencegahanKriminalitas/>
    </Box>
  );
}

function ListPencegahanKriminalitas() {
  const kriminalitasState = useProxy(pencegahanKriminalitasState)
  const router = useRouter();

  useShallowEffect(() => {
    kriminalitasState.findMany.load()
  }, [])

  if (!kriminalitasState.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500}/>
      </Box>
    )
  }

  return (
      <Box py={10}>
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Pencegahan Kriminalitas'
          href='/admin/keamanan/pencegahan-kriminalitas/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Pencegahan Kriminalitas</TableTh>
              <TableTh>Slug</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {kriminalitasState.findMany.data?.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.programKeamanan.nama}</TableTd>
                <TableTd>{item.programKeamanan.slug}</TableTd>
                <TableTd>
                  <Text fz={'sm'} dangerouslySetInnerHTML={{__html: item.programKeamanan.deskripsi || ''}} />
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/keamanan/pencegahan-kriminalitas/${item.id}`)}>
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

export default PencegahanKriminalitas;
