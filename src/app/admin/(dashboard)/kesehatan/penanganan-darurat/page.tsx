'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Image, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
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
      <ListPenangananDarurat search={search} />
    </Box>
  );
}

function ListPenangananDarurat({ search }: { search: string }) {
  const penangananDaruratState = useProxy(penangananDarurat)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = penangananDaruratState.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
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
                      <Box w={100}>
                        <Text lineClamp={1} truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                      </Box>
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
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)} // ini penting!
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  )
}

export default PenangananDarurat;
