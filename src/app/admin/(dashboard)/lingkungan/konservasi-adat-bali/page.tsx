import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import React from 'react';
import HeaderSearch from '../../_com/header';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import colors from '@/con/colors';
import JudulList from '../../_com/judulList';

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
                  <TableTh>Judul</TableTh>
                  <TableTh>Gambar</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                <TableTr>
                  <TableTd>
                    <Box w={100}>
                      <Text truncate="end" fz={"sm"}>Judul</Text>
                    </Box>
                  </TableTd>
                  <TableTd>
                    <Image w={100} src="/" alt="image" />
                  </TableTd>
                  <TableTd>Deskripsi</TableTd>
                  <TableTd>
                    <Button>
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
