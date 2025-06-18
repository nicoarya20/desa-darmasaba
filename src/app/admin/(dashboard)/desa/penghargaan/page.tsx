'use client'
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import JudulListTab from '../../_com/jusulListTab';

function Penghargaan() {
  const state = useProxy(penghargaanState)
  const router = useRouter()
  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  if (!state.findMany.data) {
    return(
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulListTab
          title='List Penghargaan'
          href='/admin/desa/penghargaan/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={16} />}
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {state.findMany.data?.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>
                  <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                </TableTd>
                <TableTd>
                  <Image w={100} src={item.image?.link} alt="gambar" />
                </TableTd>  
                <TableTd>
                  <Text>
                    <Button onClick={() => router.push(`/admin/desa/penghargaan/${item.id}`)}>
                    <IconDeviceImac size={20} />
                  </Button>
                </Text>
              </TableTd>
            </TableTr>
          ))}
          </TableTbody>
        </Table>
      </Paper>
    </Box>
  );
}

export default Penghargaan;
