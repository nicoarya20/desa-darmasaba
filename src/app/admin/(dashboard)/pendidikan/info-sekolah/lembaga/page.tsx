'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import infoSekolahPaud from '../../../_state/pendidikan/info-sekolah-paud';


function Lembaga() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Lembaga'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListLembaga search={search} />
    </Box>
  );
}

function ListLembaga({ search }: { search: string }) {
  const stateList = useProxy(infoSekolahPaud.lembagaPendidikan)
  const router = useRouter()


  useShallowEffect(() => {
    stateList.findMany.load()
  }, [])

  const filteredData = (stateList.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.jenjangPendidikan?.nama.toLowerCase().includes(keyword)
    );
  });

  if (!stateList.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Lembaga'
          href='/admin/pendidikan/info-sekolah/lembaga/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Lembaga</TableTh>
              <TableTh>Jenjang Pendidikan</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>{item.jenjangPendidikan?.nama}</TableTd>
                <TableTd>
                  <Button color="blue" onClick={() => router.push(`/admin/pendidikan/info-sekolah/lembaga/${item.id}`)}>
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

export default Lembaga;
