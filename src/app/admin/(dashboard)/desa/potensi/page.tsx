
'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput, Title } from '@mantine/core';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import potensiDesaState from '../../_state/desa/potensi';
import { useRouter } from 'next/navigation';
import { useShallowEffect } from '@mantine/hooks';


function Potensi() {
  return (
    <Box>
      <Grid>
        <GridCol span={{ base: 12, md: 9 }}>
          <Title order={3}>Potensi Desa</Title>
        </GridCol>
        <GridCol span={{ base: 12, md: 3 }}>
          <Paper radius={"lg"} bg={colors['white-1']}>
            <TextInput
              radius="lg"
              placeholder='pencarian'
              leftSection={<IconSearch size={20} />} />
          </Paper>
        </GridCol>
      </Grid>
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
          <Grid>
            <GridCol span={{ base: 12, md: 11 }}>
              <Text fz={"xl"} fw={"bold"}>List Potensi</Text>
            </GridCol>
            <GridCol span={{ base: 12, md: 1}}>
              <Button onClick={() => router.push("/admin/desa/potensi/create")} bg={colors['blue-button']}>
                <IconCircleDashedPlus size={25} />
              </Button>
            </GridCol>
          </Grid>
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
