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
import { useState } from 'react';

function PencegahanKriminalitas() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pencegahan Kriminalitas'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPencegahanKriminalitas search={search}/>
    </Box>
  );
}

function ListPencegahanKriminalitas({ search }: { search: string }) {
  const kriminalitasState = useProxy(pencegahanKriminalitasState)
  const router = useRouter();

  useShallowEffect(() => {
    kriminalitasState.findMany.load()
  }, [])

  const filteredData = (kriminalitasState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.programKeamanan.nama.toLowerCase().includes(keyword) ||
      item.programKeamanan.slug.toLowerCase().includes(keyword) ||
      item.programKeamanan.deskripsi?.toLowerCase().includes(keyword)
    );
  });

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
            {filteredData.map((item) => (
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
