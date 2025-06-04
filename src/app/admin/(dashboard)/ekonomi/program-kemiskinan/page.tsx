'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function ProgramKemiskinan() {
  return (
    <Box>
      <HeaderSearch
        title='Program Kemiskinan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListProgramKemiskinan/>
    </Box>
  );
}

function ListProgramKemiskinan() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Program Kemiskinan'
          href='/admin/ekonomi/program-kemiskinan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Judul Program</TableTh>
              <TableTh>Deskripsi Singkat</TableTh>
              <TableTh>Jumlah Masyarakat Miskin</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Program A</TableTd>
              <TableTd>Deskripsi Program A</TableTd>
              <TableTd>100</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/program-kemiskinan/detail')}>
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

export default ProgramKemiskinan;
