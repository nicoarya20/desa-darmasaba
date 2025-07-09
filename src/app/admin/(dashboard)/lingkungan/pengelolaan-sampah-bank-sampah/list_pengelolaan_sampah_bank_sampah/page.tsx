'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import JudulListTab from '../../../_com/judulListTab';

function ListPengelolaanSampahBankSampah() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <JudulListTab
            title='Mekanisme Bank Sampah'
            href='/admin/lingkungan/pengelolaan-sampah-bank-sampah/list_pengelolaan_sampah_bank_sampah/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={20} />}
          />
          <Title order={4}>List Mekanisme Bank Sampah</Title>
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul</TableTh>
                  <TableTh>Gambar</TableTh>
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
                    <Image w={100} alt="image" />
                  </TableTd>
                  <TableTd>
                    <Button onClick={() => router.push('/admin/lingkungan/pengelolaan-sampah-bank-sampah/list_pengelolaan_sampah_bank_sampah/detail')}>
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

export default ListPengelolaanSampahBankSampah;
