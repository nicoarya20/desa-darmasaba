import colors from '@/con/colors';
import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import JudulList from '../../_com/judulList';
import HeaderSearch from '../../_com/header';

function Puskesmas() {
  return (
    <Box>
      <HeaderSearch
        title='Puskesmas'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPuskesmas/>
    </Box>
  );
}

function ListPuskesmas() {
  return (
    <Box py={10}>
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack>
        <JudulList
          title='List Puskesmas'
          href='/admin/kesehatan/puskesmas/create'
        />
        <Box style={{ overflowX: "auto" }}>
          <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh>Judul</TableTh>
                <TableTh>Kategori</TableTh>
                <TableTh>Image</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              <TableTr>
                <TableTd>
                  <Box w={100}>
                    <Text truncate="end" fz={"sm"}>Test</Text>
                  </Box></TableTd>
                <TableTd>Test</TableTd>
                <TableTd>
                  <Image w={100} src={"/"} alt="image" />
                </TableTd>
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

export default Puskesmas;
