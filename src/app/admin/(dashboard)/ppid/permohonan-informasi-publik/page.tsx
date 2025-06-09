'use client'
import colors from '@/con/colors';
import { Box, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import statepermohonanInformasiPublikForm from '../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';

function Page() {
  const permohonanInformasiPublikState = useProxy(statepermohonanInformasiPublikForm)
  useShallowEffect(() => {
    permohonanInformasiPublikState.statepermohonanInformasiPublik.findMany.load()
  }, [])
  if (!permohonanInformasiPublikState.statepermohonanInformasiPublik.findMany.data)
    return <Stack pos={"relative"} bg={colors.Bg}>
      <Skeleton radius={5} h={200} />
    </Stack>

  return (
    <Box py={5}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={3}>Permohonan Informasi Publik</Title>
          <Box>
            <Table striped withRowBorders withColumnBorders withTableBorder>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Nama</TableTh>
                  <TableTh>NIK</TableTh>
                  <TableTh>Telepon</TableTh>
                  <TableTh>Email</TableTh>
                  <TableTh>Jenis Informasi</TableTh>
                  <TableTh>Cara Memperoleh Informasi</TableTh>
                  <TableTh>Cara Memperoleh Salinan Informasi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {permohonanInformasiPublikState.statepermohonanInformasiPublik.findMany.data?.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>{index + 1}</TableTd>
                    <TableTd>{item.name}</TableTd>
                    <TableTd>{item.nik}</TableTd>
                    <TableTd>{item.notelp}</TableTd>
                    <TableTd>{item.email}</TableTd>
                    <TableTd>{item.jenisInformasiDiminta?.name}</TableTd>
                    <TableTd>{item.caraMemperolehInformasi?.name}</TableTd>
                    <TableTd>{item.caraMemperolehSalinanInformasi?.name}</TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table> </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Page;