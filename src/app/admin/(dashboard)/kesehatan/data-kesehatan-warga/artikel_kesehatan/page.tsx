'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import artikelKesehatanState from '../../../_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import { useState } from 'react';


function ArtikelKesehatan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Artikel Kesehatan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListArtikelKesehatan search={search} />
    </Box>
  );
}

function ListArtikelKesehatan({ search }: { search: string }) {
  const stateArtikelKesehatan = useProxy(artikelKesehatanState)
  const router = useRouter();

  useShallowEffect(() => {
    stateArtikelKesehatan.findMany.load()
  }, [])

  const filteredData = (stateArtikelKesehatan.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(keyword) ||
      item.content.toLowerCase().includes(keyword)
    );
  });

  if (!stateArtikelKesehatan.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
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
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate={'end'} lineClamp={1} fz={'h5'}>{item.title}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <Text truncate={'end'} lineClamp={1} fz={'h5'}>{item.content}</Text>
                      </Box>
                    </TableTd>
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
