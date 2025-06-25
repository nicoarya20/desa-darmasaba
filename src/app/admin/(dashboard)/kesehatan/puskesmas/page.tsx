'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import puskesmasState from '../../_state/kesehatan/puskesmas/puskesmas';

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
  const statePuskesmas = useProxy(puskesmasState)
  const router = useRouter();

  useShallowEffect(() => {
    statePuskesmas.findMany.load()
  }, [])

  if (!statePuskesmas.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500}/>
      </Box>
    )
  }
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
                <TableTh>Nama Puskesmas</TableTh>
                <TableTh>Alamat</TableTh>
                <TableTh>Image</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {statePuskesmas.findMany.data?.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.name}</TableTd>
                  <TableTd>{item.alamat}</TableTd>
                  <TableTd>
                    <Image w={100} src={item.image.link} alt="image" />
                  </TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/kesehatan/puskesmas/${item.id}`)}>
                      <IconDeviceImacCog size={25} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>
      </Stack>
    </Paper>
  </Box>
  )
}

export default Puskesmas;
