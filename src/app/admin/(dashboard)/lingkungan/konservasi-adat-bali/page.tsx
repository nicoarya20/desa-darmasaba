'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function KonservasiAdatBali() {
  return (
    <Box py={10}>
      <HeaderSearch
      title='Konservasi Adat Bali'
      placeholder='pencarian'
      searchIcon={<IconSearch size={20} />}
      />
      <ListKonservasiAdatBali />
    </Box>
  );
}

function ListKonservasiAdatBali() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
          title='List Konservasi Adat Bali'
          href='/admin/lingkungan/konservasi-adat-bali/create'
          />
          <Box style={{overflowX: 'auto'}}>
            <Table striped withRowBorders withTableBorder style={{minWidth: '700px'}}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul Konservasi Adat Bali</TableTh>
                  <TableTh>Deskripsi Konservasi Adat Bali</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                <TableTr>
                  <TableTd>
                    <Box w={100}>
                      <Text truncate="end" fz={"sm"}>Judul Konservasi Adat Bali</Text>
                    </Box>
                  </TableTd>
                  <TableTd>Deskripsi Konservasi Adat Bali</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push("/admin/lingkungan/konservasi-adat-bali/detail")}>
                      <IconDeviceImacCog size={25} />
                    </Button>
                  </TableTd>
                </TableTr>
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default KonservasiAdatBali;
