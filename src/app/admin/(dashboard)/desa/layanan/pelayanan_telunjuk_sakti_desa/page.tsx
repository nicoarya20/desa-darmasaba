import JudulListTab from '@/app/admin/(dashboard)/_com/jusulListTab';
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';

function SuratKeterangan() {
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulListTab
          title='List Pelayanan Telunjuk Sakti Desa'
          href='/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={16} />}
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Pelayanan Telunjuk Sakti Desa</TableTd>
              <TableTd>Deskripsi Pelayanan Telunjuk Sakti Desa</TableTd>
              <TableTd>
                <Text>
                  <Button>
                    <IconDeviceImac size={20} />
                  </Button>
                </Text>
              </TableTd>
            </TableTr>
          </TableTbody>
        </Table>
      </Paper>
    </Box>
  );
}

export default SuratKeterangan;
