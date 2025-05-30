
'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import potensiDesaState from '../../_state/desa/potensi';


function Potensi() {
  return (
    <Box>
      <HeaderSearch
        title='Potensi Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPotensi />
    </Box>
  );
}

function ListPotensi() {
  const potensiState = useProxy(potensiDesaState)
  useShallowEffect(() => {
    potensiState.findMany.load()
  }, [])

  const router = useRouter()


  if (!potensiState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
          title='List Potensi'
          href='/admin/desa/potensi/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul</TableTh>
                  <TableTh>Kategori</TableTh>
                  <TableTh>Image</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {potensiState.findMany.data?.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box></TableTd>
                    <TableTd>{item.kategori}</TableTd>
                    <TableTd>
                      <Image w={100} src={item.image?.link} alt="image" />
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/desa/potensi/detail/${item.id}`)}>
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

export default Potensi;
