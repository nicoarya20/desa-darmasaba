'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function SektorUnggulanDesa() {
  return (
    <Box>
      <HeaderSearch
        title='Sektor Unggulan Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListSektorUnggulanDesa/>
    </Box>
  );
}

function ListSektorUnggulanDesa() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Sektor Unggulan Desa'
          href='/admin/ekonomi/sektor-unggulan-desa/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Sektor Unggulan</TableTh>
              <TableTh>Deskripsi Sektor Unggulan</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Sektor 1</TableTd>
              <TableTd>Deskripsi Sektor 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/sektor-unggulan-desa/detail')}>
                  <IconDeviceImac size={20} />
                </Button>
              </TableTd>
            </TableTr>
          </TableTbody>
        </Table>  
      </Paper>
    </Box>
  );
}

export default SektorUnggulanDesa;
