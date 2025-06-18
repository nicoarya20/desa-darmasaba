'use client'
import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import colors from '@/con/colors';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function GotongRoyong() {
  return (
    <Box>
      <HeaderSearch
      title='Gotong Royong'
      placeholder='pencarian'
      searchIcon={<IconSearch size={20} />}
      />
      <ListGotongRoyong/>
    </Box>
  );
}

function ListGotongRoyong() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
          title='List Gotong Royong'
          href='/admin/lingkungan/gotong-royong/create'
          />
          <Box style={{ overflowX: 'auto'}}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px'}}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul Gotong Royong</TableTh>
                  <TableTh>Kategori Gotong Royong</TableTh>
                  <TableTh>Image</TableTh>
                  <TableTh>Deskripsi Gotong Royong</TableTh>
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
                  <TableTd>Kategori</TableTd>
                  <TableTd>
                    <Image w={100} src="/" alt="image" />
                  </TableTd>
                  <TableTd>Deskripsi</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push('/admin/lingkungan/gotong-royong/detail')}>
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

export default GotongRoyong;
