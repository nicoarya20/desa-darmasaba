'use client'
import JudulListTab from '@/app/admin/(dashboard)/_com/jusulListTab';
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import stateLayananDesa from '../../../_state/desa/layananDesa';
import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';

function PelayananTelunjukSakti() {
  const telunjukSaktiState = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa)
  const router = useRouter()

  useShallowEffect(() => {
    telunjukSaktiState.findMany.load()
  }, [])

  if (!telunjukSaktiState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulListTab
          title='List Pelayanan Telunjuk Sakti Desa'
          href='/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={16} />}
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {telunjukSaktiState.findMany.data?.map((item) => (
              <TableTr key={item.id}>
              <TableTd>{item.name}</TableTd>
              <TableTd><Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} /></TableTd>
              <TableTd>
                <Text>
                  <Button onClick={() => router.push(`/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/${item.id}`)}>
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

export default PelayananTelunjukSakti;
