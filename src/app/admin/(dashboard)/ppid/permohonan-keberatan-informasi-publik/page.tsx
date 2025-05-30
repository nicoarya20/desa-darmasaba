'use client'
import colors from '@/con/colors';
import { Box, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import statePermohonanKeberatan from '../../_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi';

function Page() {
  const listState = useProxy(statePermohonanKeberatan)
  useShallowEffect(() => {
    listState.findMany.load()
  }, [])

  if (!listState.findMany.data) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={3}>Permohonan Keberatan Informasi Publik</Title>
          <Table striped withRowBorders withColumnBorders withTableBorder>
            <TableThead>
              <TableTr>
                <TableTh>No</TableTh>
                <TableTh>Nama</TableTh>
                <TableTh>Email</TableTh>
                <TableTh>Telepon</TableTh>
                <TableTh>Alasan</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {listState.findMany.data?.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd>{index + 1}</TableTd>
                  <TableTd>{item.name}</TableTd>
                  <TableTd>{item.email}</TableTd>
                  <TableTd>{item.notelp}</TableTd>
                  <TableTd dangerouslySetInnerHTML={{ __html: item.alasan }} />
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Stack>
      </Paper>
    </Box>
  );
}
export default Page;
