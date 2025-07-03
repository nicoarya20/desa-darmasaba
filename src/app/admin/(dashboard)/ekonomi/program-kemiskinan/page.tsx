'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import programKemiskinanState from '../../_state/ekonomi/program-kemiskinan';
import { useShallowEffect } from '@mantine/hooks';

function ProgramKemiskinan() {
  return (
    <Box>
      <HeaderSearch
        title='Program Kemiskinan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListProgramKemiskinan />
    </Box>
  );
}

function ListProgramKemiskinan() {
  const programState = useProxy(programKemiskinanState)
  const router = useRouter();

  useShallowEffect(() => {
    programState.findMany.load()
  }, [])

  if (!programState.findMany.data) {
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
            {programState.findMany.data?.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>
                  <Text fz={'sm'} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                </TableTd>
                <TableTd>{item.statistik?.jumlah}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/ekonomi/program-kemiskinan/${item.id}`)}>
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

export default ProgramKemiskinan;
