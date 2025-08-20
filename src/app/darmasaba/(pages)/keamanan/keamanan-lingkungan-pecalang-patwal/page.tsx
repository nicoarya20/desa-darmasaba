'use client'
import keamananLingkunganState from '@/app/admin/(dashboard)/_state/keamanan/keamanan-lingkungan';
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';


function Page() {
  const state = useProxy(keamananLingkunganState)
  const [search, setSearch] = useState('')
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, search)
  }, [page, search])

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Grid align='center' px={{ base: 'md', md: 100 }}>
          <GridCol span={{ base: 12, md: 9 }}>
            <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
              Keamanan Lingkungan (Pecalang / Patwal)
            </Text>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Puskesmas'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={{ base: "50%", md: "100%" }}
            />
          </GridCol>
        </Grid>
        <Text px={{ base: 'md', md: 100 }} ta={"justify"} fz={{ base: "h4", md: "h3" }} >
          Keamanan dan ketertiban lingkungan di Desa Darmasaba dijaga melalui peran aktif Pecalang dan Patwal (Patroli Pengawal). Mereka bertugas memastikan desa tetap aman, tertib, dan kondusif bagi seluruh warga.
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 3,
            }}>
            {data.map((v, k) => {
              return (
                <Paper radius={10} key={k} bg={colors["white-trans-1"]}>
                  <Stack gap={'xs'}>
                    <Center px={10} py={20}>
                      <Image src={v.image?.link} alt='' />
                    </Center>
                    <Box px={'lg'}>
                      <Box pb={20}>
                        <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                          {v.name}
                        </Text>
                        <Text pb={10} fz={"h4"} ta={'justify'} dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
        </Stack>
      </Box>  
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)} // ini penting!
          total={totalPages}
          my="md"
        />
      </Center>
    </Stack>
  );
}

export default Page;
