'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Image, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import puskesmasState from '../../_state/kesehatan/puskesmas/puskesmas';
import { useState } from 'react';

function Puskesmas() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Puskesmas'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPuskesmas search={search} />
    </Box>
  );
}

function ListPuskesmas({ search }: { search: string }) {
  const statePuskesmas = useProxy(puskesmasState)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = statePuskesmas.findMany;

  useShallowEffect(() => {
    load(page, 3, search)
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
            title='List Puskesmas'
            href='/admin/kesehatan/puskesmas/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Nama Puskesmas</TableTh>
                  <TableTh>Alamat</TableTh>
                  <TableTh>Image</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.name}</TableTd>
                    <TableTd>{item.alamat}</TableTd>
                    <TableTd>
                      <Image w={100} src={item.image.link} alt="image" />
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/kesehatan/puskesmas/${item.id}`)}>
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

export default Puskesmas;
