'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = statePosyandu.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || [];

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
                  <TableTd>
                    <Box w={100}>
                      <Text truncate="end" lineClamp={1} fz={"sm"}>{item.name}</Text>
                    </Box>
                  </TableTd>
                  <TableTd>
                    <Box w={100}>
                      <Text truncate="end" lineClamp={1} fz={"sm"}>{item.nomor}</Text>
                    </Box>
                  </TableTd>
                  <TableTd>
                    <Box w={100}>
                      <Text truncate="end" lineClamp={1} fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    </Box>
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
  );
}

export default Posyandu;
