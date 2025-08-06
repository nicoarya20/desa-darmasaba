/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function SuratKeterangan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pelayanan Surat Keterangan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListSuratKeterangan search={search} />
    </Box>
  );
}

function ListSuratKeterangan({ search }: { search: string }) {
  const suratKeteranganState = useProxy(stateLayananDesa.suratKeterangan)
  const router = useRouter()

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = suratKeteranganState.findMany;

  useEffect(() => {
    load(page, 10)
  }, [])

   const filteredData = useMemo(() => {
      if (!data) return [];
      return data.filter(item => {
        const keyword = search.toLowerCase();
        return (
          item.name?.toLowerCase().includes(keyword) ||
          item.deskripsi?.toLowerCase().includes(keyword)
        );
      })
    }, [data, search]); 
  
    // Handle loading state
    if (loading || !data) {
      return (
        <Stack py={10}>
          <Skeleton height={300} />
        </Stack>
      );
    }
  
    if (data.length === 0) {
      return (
        <Box py={10}>
           <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Surat Keterangan'
            href='/admin/desa/layanan/pelayanan_surat_keterangan/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>Nama</TableTh>
                  <TableTh>Deskripsi</TableTh>
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
        <JudulList
          title='List Surat Keterangan'
          href='/admin/desa/layanan/pelayanan_surat_keterangan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>
                  <Box w={200}>
                  <Text truncate="end" fz={"sm"}>{item.name}</Text>
                  </Box>
                </TableTd>  
                <TableTd>
                  <Box w={300}>
                  <Text truncate="end" lineClamp={1} fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                  </Box>
                </TableTd>
                <TableTd>
                  <Text>
                    <Button onClick={() => router.push(`/admin/desa/layanan/pelayanan_surat_keterangan/${item.id}`)}>
                    <IconDeviceImac size={20} />
                  </Button>
                </Text>
              </TableTd>
            </TableTr>
          ))}
          </TableTbody>
        </Table>
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
  );
}

export default SuratKeterangan;
