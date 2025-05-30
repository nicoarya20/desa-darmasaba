import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import React from 'react';
import HeaderSearch from '../../_com/header';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import colors from '@/con/colors';
import JudulList from '../../_com/judulList';

function DataLingkunganDesa() {
  return (
    <Box>
      <HeaderSearch
      title='Data Lingkungan Desa'
      placeholder='pencarian'
      searchIcon={<IconSearch size={20} />}
      />
      <ListDataLingkunganDesa/>
    </Box>
  );
}

function ListDataLingkunganDesa() {
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p="md">
        <Stack>
          <JudulList
          title='List Data Lingkungan Desa'
          href='/admin/lingkungan/data-lingkungan-desa/create'
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
                    <Image w={100}  alt="image" />
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

export default DataLingkunganDesa;
