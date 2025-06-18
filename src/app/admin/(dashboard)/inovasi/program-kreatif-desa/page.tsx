'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function ProgramKreatifDesa() {
  return (
    <Box>
      <HeaderSearch
        title='Program Kreatif Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListProgramKreatifDesa/>
    </Box>
  );
}

function ListProgramKreatifDesa() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Program Kreatif Desa'
          href='/admin/inovasi/program-kreatif-desa/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Program Kreatif Desa</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Deskripsi Singkat</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Program Kreatif Desa 1</TableTd>
              <TableTd>Image</TableTd>
              <TableTd>Deskripsi Singkat</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/inovasi/program-kreatif-desa/detail')}>
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

export default ProgramKreatifDesa;
