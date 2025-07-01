'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import tipsKeamananState from '../../_state/keamanan/tips-keamanan';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';

function TipsKeamanan() {
  return (
    <Box>
      <HeaderSearch
        title='Tips Keamanan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListTipsKeamanan/>
    </Box>
  );
}

function ListTipsKeamanan() {
  const stateKeamanan = useProxy(tipsKeamananState)
  const router = useRouter();

  useShallowEffect(() => {
    stateKeamanan.findMany.load()
  }, [])

  if (!stateKeamanan.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Tips Keamanan'
          href='/admin/keamanan/tips-keamanan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Tips Keamanan</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {stateKeamanan.findMany.data?.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.judul}</TableTd>
                <TableTd>
                  <Text fz={"xs"} dangerouslySetInnerHTML={{__html: item.deskripsi}} />
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/keamanan/tips-keamanan/${item.id}`)}>
                    <IconDeviceImac size={20} />
                </Button>
              </TableTd>
            </TableTr>
          ))}
          </TableTbody>
        </Table>  
      </Paper>
    </Box>
  );
}

export default TipsKeamanan;
