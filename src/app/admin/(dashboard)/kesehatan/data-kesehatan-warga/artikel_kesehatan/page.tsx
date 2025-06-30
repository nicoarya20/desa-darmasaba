'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import artikelKesehatanState from '../../../_state/kesehatan/data_kesehatan_warga/artikelKesehatan';


function ArtikelKesehatan() {
  return (
    <Box>
      <HeaderSearch
        title='Artikel Kesehatan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListArtikelKesehatan/>
    </Box>
  );
}

function ListArtikelKesehatan() {
  const stateArtikelKesehatan = useProxy(artikelKesehatanState)
  const router = useRouter();

  useShallowEffect(() => {
    stateArtikelKesehatan.findMany.load()
  }, [])

  if (!stateArtikelKesehatan.findMany.data) {
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
          title='List Artikel Kesehatan'
          href='/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan/create'
        />
        <Box style={{ overflowX: "auto" }}>
          <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh>Judul</TableTh>
                <TableTh>Content</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {stateArtikelKesehatan.findMany.data?.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.title}</TableTd>
                  <TableTd>{item.content}</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan/${item.id}`)}>
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

export default ArtikelKesehatan;
