'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import JudulList from '../../_com/judulList';
import HeaderSearch from '../../_com/header';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import kontakDarurat from '../../_state/kesehatan/kontak-darurat/kontakDarurat';
import { useShallowEffect } from '@mantine/hooks';

function KontakDarurat() {
  return (
    <Box>
      <HeaderSearch
        title='Kontak Darurat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListKontakDarurat />
    </Box>
  );
}

function ListKontakDarurat() {
  const kontakDaruratState = useProxy(kontakDarurat)
  const router = useRouter();

  useShallowEffect(() => {
    kontakDaruratState.findMany.load()
  }, [])

  if (!kontakDaruratState.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
            title='List Kontak Darurat'
            href='/admin/kesehatan/kontak-darurat/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Image</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {kontakDaruratState.findMany.data?.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    </TableTd>
                    <TableTd>
                      <Image w={100} src={item.image?.link} alt="image" />
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/kesehatan/kontak-darurat/${item.id}`)}>
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

export default KontakDarurat;
