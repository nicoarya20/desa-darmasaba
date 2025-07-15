'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';

import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import layananonlineDesa from '../../../_state/inovasi/layanan-online-desa';

function AdministrasiOnline() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Administrasi Online'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAdministrasiOnline search={search} />
    </Box>
  );
}

function ListAdministrasiOnline({ search }: { search: string }) {
  const listState = useProxy(layananonlineDesa.administrasiOnline)
  const router = useRouter();
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany;

  useShallowEffect(() => {
    load(page, 10);
  }, [page]);

  const filteredData = (data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.alamat.toLowerCase().includes(keyword) ||
      item.nomorTelepon.toLowerCase().includes(keyword)
    );
  });

  if (loading || !data) {
    return <Skeleton h={500} />;
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Title order={3} mb={10}>List Administrasi Online</Title>
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Layanan</TableTh>
              <TableTh>Alamat</TableTh>
              <TableTh>Nomor Telepon</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
            <TableTbody style={{ overflowX: "auto" }}>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.name}</TableTd>
                  <TableTd>{item.alamat}</TableTd>
                  <TableTd>{item.nomorTelepon}</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin//inovasi/layanan-online-desa/administrasi-online/${item.id}`)}>
                      <IconDeviceImac size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
        </Table>
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

export default AdministrasiOnline;
