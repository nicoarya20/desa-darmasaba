'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import korupsiState from '../../../_state/landing-page/desa-anti-korupsi';

function DesaAntiKorupsi() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='List Desa Anti Korupsi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDesaAntiKorupsi search={search} />
    </Box>
  );
}

function ListDesaAntiKorupsi({ search }: { search: string }) {
  const listState = useProxy(korupsiState.desaAntikorupsi)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || []

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={550} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Desa Anti Korupsi'
            href='/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>Nama</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Kategori</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
            </Table>
          </Box>
        </Paper>
      </Box>
    );
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
            title='List Desa Anti Korupsi'
            href='/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/create'
          />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Nama Desa Anti Korupsi</TableTh>
                  <TableTh>Deskripsi Desa Anti Korupsi</TableTh>
                  <TableTh>Kategori Desa Anti Korupsi</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                      </Box>
                    </TableTd>
                    <TableTd>{item.kategori?.name}</TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/${item.id}`)}>
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
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo(0, 0);
          }}
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  )
}

export default DesaAntiKorupsi;
