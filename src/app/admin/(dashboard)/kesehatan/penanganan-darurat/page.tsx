'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import JudulList from '../../_com/judulList';
import HeaderSearch from '../../_com/header';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import penangananDarurat from '../../_state/kesehatan/penanganan-darurat/penangananDarurat';
import { useState } from 'react';

function PenangananDarurat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='PenangananDarurat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPenangananDarurat search={search}/>
    </Box>
  );
}

function ListPenangananDarurat({ search }: { search: string }) {
  const penangananDaruratState = useProxy(penangananDarurat)
  const router = useRouter();

  useShallowEffect(() => {
    penangananDaruratState.findMany.load()
  }, [])

  const filteredData = (penangananDaruratState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword)
    );
  });

  if (!penangananDaruratState.findMany.data) {
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
          title='List Penanganan Darurat'
          href='/admin/kesehatan/penanganan-darurat/create'
        />
        <Box style={{ overflowX: "auto" }}>
          <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh>Judul</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Image</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                <TableTd>
                  <Box w={100}>
                    <Text truncate="end" fz={"sm"}>{item.name}</Text>
                  </Box></TableTd>
                <TableTd>
                  <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                </TableTd>
                <TableTd>
                  <Image w={100} src={item.image?.link} alt="image" />
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/kesehatan/penanganan-darurat/${item.id}`)}>
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

export default PenangananDarurat;
