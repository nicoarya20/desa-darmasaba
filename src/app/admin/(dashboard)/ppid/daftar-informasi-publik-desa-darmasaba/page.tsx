'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import daftarInformasiPublik from '../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

function Page() {
  return (
    <Box>
      <Grid>
        <GridCol span={{ base: 12, md: 9 }}>
          <Title order={3}>Daftar Informasi Publik Desa Darmasaba</Title>
        </GridCol>
        <GridCol span={{ base: 12, md: 3 }}>
          <Paper radius={"lg"} bg={colors['white-1']}>
            <TextInput
              radius={"lg"}
              placeholder='pencarian'
              leftSection={<IconSearch size={20} />}
            />
          </Paper>
        </GridCol>
      </Grid>
      <ListDaftarInformasi />
    </Box>
  );
}

function ListDaftarInformasi() {
  const listData = useProxy(daftarInformasiPublik)

  useShallowEffect(() => {
    listData.findMany.load()
  }, [])

  const router = useRouter()

  if (!listData.findMany.data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <Grid>
            <GridCol span={{ base: 12, md: 11 }}>
              <Text fz={"xl"} fw={"bold"}>List Daftar Informasi Publik Desa Darmasaba</Text>
            </GridCol>
            <GridCol span={{ base: 12, md: 1 }}>
              <Button onClick={() => router.push("/admin/ppid/daftar-informasi-publik-desa-darmasaba/create")} bg={colors['blue-button']}>
                <IconCircleDashedPlus size={25} />
              </Button>
            </GridCol>
          </Grid>
          <Box style={{ overflowX: "auto" }}>
            <Table
              striped
              withTableBorder
              withRowBorders
              bg={colors['white-1']}
              style={{ minWidth: '700px' }}
            >
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Jenis Informasi</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {listData.findMany.data?.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>{index + 1}</TableTd>
                    <TableTd>{item.jenisInformasi}</TableTd>
                    <TableTd dangerouslySetInnerHTML={{ __html: item.deskripsi }}></TableTd>
                    <TableTd>
                      <Button bg={"green"} onClick={() => router.push(`/admin/ppid/daftar-informasi-publik-desa-darmasaba/${item.id}`)}>
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

export default Page;
