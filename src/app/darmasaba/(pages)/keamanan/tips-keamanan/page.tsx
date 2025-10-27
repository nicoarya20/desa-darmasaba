'use client'
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import tipsKeamananState from '@/app/admin/(dashboard)/_state/keamanan/tips-keamanan';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';


function Page() {
  const state = useProxy(tipsKeamananState)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch)
  }, [page, debouncedSearch])

  if (loading || !data) {
    return (
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
        <Skeleton h={500} />
      </Stack>
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
              Tips Keamanan
            </Text>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Tips'
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
                    <Center p={10}>
                      <Image src={v.image?.link} radius={10} loading="lazy"
                        alt='' />
                    </Center>
                    <Box px={'xl'}>
                      <Box pb={20}>
                        <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                          {v.judul}
                        </Text>
                        <Box>
                          <Text pb={10} fz={"md"} style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
                        </Box>
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
