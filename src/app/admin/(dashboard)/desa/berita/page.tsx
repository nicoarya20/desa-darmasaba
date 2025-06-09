'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateDashboardBerita from '../../_state/desa/berita';


function Page() {
  return (
    <Box>
      <Grid>
        <GridCol span={{ base: 12, md: 9 }}>
          <Title order={3}>Berita</Title>
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
      <BeritaList />
    </Box>
  );
}

function BeritaList() {
  const beritaState = useProxy(stateDashboardBerita)

  useShallowEffect(() => {
    beritaState.berita.findMany.load()
  }, [])

  const router = useRouter()

  if (!beritaState.berita.findMany.data) {
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
          <Grid>
            <GridCol span={{ base: 12, md: 11 }}>
              <Text fz={"xl"} fw={"bold"}>List Berita</Text>
            </GridCol>
            <GridCol span={{ base: 12, md: 1 }}>
              <Button onClick={() => router.push("/admin/desa/berita/create")} bg={colors['blue-button']}>
                <IconCircleDashedPlus size={25} />
              </Button>
            </GridCol>
          </Grid>
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}> 
              <TableThead>
                <TableTr>
                  <TableTh w={250}>Judul</TableTh>
                  <TableTh w={250}>Kategori</TableTh>
                  <TableTh w={250}>Image</TableTh>
                  <TableTh w={200}>Detail</TableTh>

                </TableTr>
              </TableThead>
              <TableTbody >
                {beritaState.berita.findMany.data?.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd >
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.judul}</Text>
                      </Box>
                    </TableTd>
                    <TableTd >{item.kategoriBerita?.name}</TableTd>
                    <TableTd>
                      <Image w={100} src={item.image?.link} alt="gambar" />
                    </TableTd>
                    <TableTd>
                      <Button bg={"green"} onClick={() => router.push(`/admin/desa/berita/${item.id}`)}>
                        <IconDeviceImacCog size={25} />
                      </Button>
                    </TableTd>

                  </TableTr>
                ))}
              </TableTbody>
            </Table> </Box>
        </Stack>
      </Paper>

    </Box>
  )
}

export default Page;
