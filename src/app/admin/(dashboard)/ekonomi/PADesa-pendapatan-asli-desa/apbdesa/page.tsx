'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import PendapatanAsliDesa from '../../../_state/ekonomi/PADesa';


function APBDesa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='APB Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAPBDesa search={search} />
    </Box>
  );
}

function ListAPBDesa({ search }: { search: string }) {
  const apbDesaState = useProxy(PendapatanAsliDesa.ApbDesa)
  const router = useRouter();

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  useShallowEffect(() => {
    apbDesaState.findMany.load();
  }, [])

  const filteredData = (apbDesaState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.tahun.toString().toLowerCase().includes(keyword) ||
      item.pembiayaan.map((item) => item.value.toString()).includes(keyword) ||
      item.belanja.map((item) => item.value.toString()).includes(keyword) ||
      item.pendapatan.map((item) => item.value.toString()).includes(keyword)
    );
  });

  if (!apbDesaState.findMany.data) {
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
          title='List APB Desa'
          href='/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Tahun</TableTh>
              <TableTh>Pembiayaan</TableTh>
              <TableTh>Belanja</TableTh>
              <TableTh>Pendapatan</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.tahun}</TableTd>
                <TableTd>{formatRupiah(item.pembiayaan.reduce((sum, item) => sum + Number(item.value), 0))}</TableTd>
                <TableTd>{formatRupiah(item.belanja.reduce((sum, item) => sum + Number(item.value), 0))}</TableTd>
                <TableTd>{formatRupiah(item.pendapatan.reduce((sum, item) => sum + Number(item.value), 0))}</TableTd>
                <TableTd>
                  <Button
                    bg={"green"}
                    onClick={() =>
                      router.push(`/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa/${item.id}`)
                    }
                  >
                    <IconDeviceImacCog size={25} />
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

export default APBDesa;
