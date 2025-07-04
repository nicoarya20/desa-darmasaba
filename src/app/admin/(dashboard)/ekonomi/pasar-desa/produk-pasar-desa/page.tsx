'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import pasarDesaState from '../../../_state/ekonomi/pasar-desa/pasar-desa';

function PasarDesa() {
  return (
    <Box>
      <HeaderSearch
        title='Produk Pasar Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPasarDesa />
    </Box>
  );
}

function ListPasarDesa() {
  const statePasar = useProxy(pasarDesaState.pasarDesa)
  const router = useRouter();

  useShallowEffect(() => {
    statePasar.findMany.load()
  }, [])

  if (!statePasar.findMany.data) {
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
          title='List Produk Pasar Desa'
          href='/admin/ekonomi/pasar-desa/produk-pasar-desa/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Produk</TableTh>
              <TableTh>Harga Produk</TableTh>
              <TableTh>Rating Produk</TableTh>
              <TableTh>Alamat Usaha</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {statePasar.findMany.data?.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>Rp.{item.harga}</TableTd>
                <TableTd>{item.rating}</TableTd>
                <TableTd>{item.alamatUsaha}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/ekonomi/pasar-desa/produk-pasar-desa/${item.id}`)}>
                    <IconDeviceImac size={20} />
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

export default PasarDesa;
