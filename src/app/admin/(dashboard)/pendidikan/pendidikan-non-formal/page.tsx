'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';

function PendidikanNonFormal() {
  return (
    <Box>
      <HeaderSearch
      title='Pendidikan Non Formal'
      placeholder='pencarian'
      searchIcon={<IconSearch size={20} />}
      />
      <ListPendidikanNonFormal/>
    </Box>
  );
}

function ListPendidikanNonFormal() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p="md">
        <Stack>
        <JudulList
          title='List Pendidikan Non Formal'
          href='/admin/pendidikan/pendidikan-non-formal/create'
          />
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
                    <Button onClick={() => router.push('/admin/pendidikan/pendidikan-non-formal/detail')}>
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

export default PendidikanNonFormal;
