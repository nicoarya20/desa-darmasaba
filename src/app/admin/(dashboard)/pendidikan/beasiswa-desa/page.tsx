'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import HeaderSearch from '../../_com/header';

function BeasiswaDesa() {
  return (
    <Box>
      <HeaderSearch
      title='Beasiswa Desa'
      placeholder='pencarian'
      searchIcon={<IconSearch size={20} />}
      />
      <ListBeasiswaDesa/>
    </Box>
  );
}

function ListBeasiswaDesa() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p="md">
        <Stack>
          <Title order={4}>List Beasiswa Desa</Title>
          <Box style={{overflowX: 'auto'}}>
            <Table striped withRowBorders withTableBorder style={{minWidth: '700px'}}>
              <TableThead>
                <TableTr>
                  <TableTh>Nomor</TableTh>
                  <TableTh>Nama Lengkap</TableTh>
                  <TableTh>Nomor Telepon</TableTh>
                  <TableTh>Email</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                <TableTr>
                  <TableTd>
                    <Box w={100}>
                      <Text truncate="end" fz={"sm"}>1</Text>
                    </Box>
                  </TableTd>
                  <TableTd>
                    <Text truncate="end" fz={"sm"}>Nama Lengkap</Text>
                  </TableTd>
                  <TableTd>
                    <Text truncate="end" fz={"sm"}>Nomor Telepon</Text>
                  </TableTd>
                  <TableTd>
                    <Text truncate="end" fz={"sm"}>Email</Text>
                  </TableTd>
                  <TableTd>
                    <Button onClick={() => router.push('/admin/pendidikan/beasiswa-desa/detail')}>
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

export default BeasiswaDesa;
