'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import posyandustate from '../../_state/kesehatan/posyandu/posyandu';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function Posyandu() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Posyandu'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPosyandu search={search} />
    </Box>
  );
}

function ListPosyandu({ search }: { search: string }) {
  const statePosyandu = useProxy(posyandustate)
  const router = useRouter();

  useShallowEffect(() => {
    statePosyandu.findMany.load()
  }, [])

  const filteredData = (statePosyandu.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.nomor.toString().toLowerCase().includes(keyword)
    );
  });

  if (!statePosyandu.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Posyandu'
          href='/admin/kesehatan/posyandu/create'
        />
        <Box style={{ overflowX: "auto" }}>
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama Posyandu</TableTh>
                <TableTh>Nomor Posyandu</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.name}</TableTd>
                  <TableTd>{item.nomor}</TableTd>
                  <TableTd>
                    <Text fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                  </TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/kesehatan/posyandu/${item.id}`)}>
                      <IconDeviceImac size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}

export default Posyandu;
