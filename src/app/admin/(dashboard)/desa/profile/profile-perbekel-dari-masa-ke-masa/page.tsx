'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import stateProfileDesa from '../../../_state/desa/profile';

function PerbekelDariMasaKeMasa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Perbekel Dari Masa Ke Masa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPerbekelDariMasaKeMasa search={search} />
    </Box>
  );
}

function ListPerbekelDariMasaKeMasa({ search }: { search: string }) {
  const state = useProxy(stateProfileDesa.mantanPerbekel)
  const router = useRouter();
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = (data || [])

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
          title='List Perbekel Dari Masa Ke Masa'
          href='/admin/desa/profile/profile-perbekel-dari-masa-ke-masa/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Perbekel</TableTh>
              <TableTh>Periode</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>
                  <Box w={200}>
                    <Text lineClamp={1}>{item.nama}</Text>
                  </Box>
                </TableTd>
                
                <TableTd>
                <Box w={200}>
                    <Text lineClamp={1}>{item.periode}</Text>
                  </Box>  
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/desa/profile/profile-perbekel-dari-masa-ke-masa/${item.id}`)}>
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

export default PerbekelDariMasaKeMasa;
