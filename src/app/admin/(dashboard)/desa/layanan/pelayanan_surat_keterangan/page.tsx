'use client'
import JudulListTab from '@/app/admin/(dashboard)/_com/jusulListTab';
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import stateLayananDesa from '../../../_state/desa/layananDesa';
import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';

function SuratKeterangan() {
  const suratKeteranganState = useProxy(stateLayananDesa.suratKeterangan)
  const router = useRouter()

  useShallowEffect(() => {
    suratKeteranganState.findMany.load()
  }, [])

  if (!suratKeteranganState.findMany.data) {
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
          title='List Surat Keterangan'
          href='/admin/desa/layanan/pelayanan_surat_keterangan/create'
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
            {suratKeteranganState.findMany.data?.map((item) => (
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
                    <Button onClick={() => router.push(`/admin/desa/layanan/pelayanan_surat_keterangan/${item.id}`)}>
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

export default SuratKeterangan;
