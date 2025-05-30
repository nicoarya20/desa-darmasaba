'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
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






// function BeritaList() {
//   const beritaState = useProxy(stateDashboardBerita)
//   useShallowEffect(() => {
//     beritaState.berita.findMany.load()
//   }, [])



//   const router = useRouter()

//   if (!beritaState.berita.findMany.data) return <Stack py={10}>
//     {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
//   </Stack>
//   return (
//     <Box py={10}>
//       <Paper bg={colors['white-1']} p={'md'}>
//         <Stack>
//           <Text fz={"xl"} fw={"bold"}>List Berita</Text>
//           <SimpleGrid cols={{ base: 1, md: 4 }}>
//             {beritaState.berita.findMany.data?.map((item) => (
//               <Paper key={item.id} bg={colors['BG-trans']} p={'md'}>
//                 <Box >
//                   <Flex justify="flex-end" mt={10}>
//                     <ActionIcon
//                       onClick={() => beritaState.berita.delete.byId(item.id)}
//                       disabled={beritaState.berita.delete.loading}
//                       color={colors['blue-button']} variant='transparent'>
//                       <IconX size={20} />
//                     </ActionIcon>
//                     <ActionIcon onClick={() => {
//                       router.push("/desa/berita/edit");
//                     }} color={colors['blue-button']} variant='transparent'>
//                       <IconEdit size={20} />
//                     </ActionIcon>
//                   </Flex>
//                   <Text fw={"bold"} fz={"sm"}>
//                     Kategori
//                   </Text>
//                   <Text>{item.kategoriBerita?.name}</Text>
//                   <Text fw={"bold"} fz={"sm"}>
//                     Judul
//                   </Text>
//                   <Text>{item.judul}</Text>
//                   <Text lineClamp={1} fw={"bold"} fz={"sm"}>
//                     Deskripsi
//                   </Text>
//                   <Text size='sm' lineClamp={2}>{item.deskripsi}</Text>
//                   <Text fw={"bold"} fz={"sm"}>
//                     Gambar
//                   </Text>
//                   <Image w={{ base: 100, md: 150 }} src={item.image?.link} alt="gambar" />
//                 </Box>
//               </Paper>
//             ))}
//           </SimpleGrid>
//         </Stack>
//       </Paper>
//     </Box>
//   )
// }

function BeritaList() {
  const beritaState = useProxy(stateDashboardBerita)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    beritaState.berita.findMany.load()
  }, [])

  const router = useRouter()

  const handleHapus = () => {
    if (selectedId) {
      beritaState.berita.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

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
                      <Button bg={"green"} onClick={() => router.push(`/admin/desa/berita/detail/${item.id}`)}>
                        <IconDeviceImacCog size={25} />
                      </Button>
                    </TableTd>

                  </TableTr>
                ))}
              </TableTbody>
            </Table> </Box>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus berita ini?'
      />
    </Box>
  )
}

export default Page;
