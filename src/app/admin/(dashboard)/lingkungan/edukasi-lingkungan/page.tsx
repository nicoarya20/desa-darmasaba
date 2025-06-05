'use client'
import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import React from 'react';
import HeaderSearch from '../../_com/header';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import colors from '@/con/colors';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function Page() { 
  return (
    <Box py={10}>
      <HeaderSearch
      title='Edukasi Lingkungan'
      placeholder='pencarian'
      searchIcon={<IconSearch size={20} />}
      />
      <ListEdukasiLingkungan/>
    </Box>
  );
}

function ListEdukasiLingkungan() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
          title='List Edukasi Lingkungan'
          href='/admin/lingkungan/edukasi-lingkungan/create'
          />
          <Box style={{overflowX: 'auto'}}>
            <Table striped withRowBorders withTableBorder style={{minWidth: '700px'}}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul Edukasi Lingkungan</TableTh>
                  <TableTh>Gambar</TableTh>
                  <TableTh>Deskripsi Edukasi Lingkungan</TableTh>
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
                  <TableTd>Deskripsi Edukasi Lingkungan</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push('/admin/lingkungan/edukasi-lingkungan/detail')}>
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

export default Page;
