'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import JudulListTab from '../../../_com/jusulListTab';

function KeteranganBankSampahTerdekat() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <JudulListTab
            title='Keterangan Bank Sampah Terdekat'
            href='/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan_bank_sampah_terdekat/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={20} />}
          />
          <Title order={4}>List Keterangan Bank Sampah Terdekat</Title>
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Nama Bank Sampah Terdekat</TableTh>
                  <TableTh>Gambar</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                <TableTr>
                  <TableTd>
                    <Box w={100}>
                      <Text truncate="end" fz={"sm"}>Bank Sampah Sarana Gathi</Text>
                    </Box>
                  </TableTd>
                  <TableTd>
                    <Image w={100} alt="image" />
                  </TableTd>
                  <TableTd>
                    <Button onClick={() => router.push('/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan_bank_sampah_terdekat/detail')}>
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

export default KeteranganBankSampahTerdekat;
