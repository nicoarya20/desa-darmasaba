import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import HeaderSearch from '../../_com/header';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import colors from '@/con/colors';
import JudulList from '../../_com/judulList';

function ProgramPenghijauan() {
  return (
   <Box>
    <HeaderSearch
    title='Program Penghijauan'
    placeholder='pencarian'
    searchIcon={<IconSearch size={20}/>}
    />
    <ListManfaatPenghijauan/>
   </Box>
  );
}

function ListManfaatPenghijauan() {
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
          title='List Manfaat Program Penghijauan'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul</TableTh>
                  <TableTh>Gambar</TableTh>
                  <TableTh>Jumlah</TableTh>
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
                    <Text truncate="end" fz={"sm"}>Jumlah</Text>
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

export default ProgramPenghijauan;
