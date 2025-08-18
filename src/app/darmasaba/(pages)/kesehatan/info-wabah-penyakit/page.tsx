'use client'
import infoWabahPenyakit from '@/app/admin/(dashboard)/_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(infoWabahPenyakit)
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
      <Grid align='center' px={{ base: 'md', md: 100 }}>
        <GridCol span={{ base: 12, md: 9 }}>
          <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
            Info Wabah / Penyakit
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 3 }}>
          <TextInput
            radius={"lg"}
            placeholder='Cari Info Wabah / Penyakit'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={20} />}
            w={{ base: "50%", md: "100%" }}
          />
        </GridCol>
      </Grid>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            cols={{
              base: 1,
              md: 3,
            }}
          >
            {data.map((v, k) => {
              return (
                <Paper key={k} p={'xl'} bg={colors['white-trans-1']}>
                  <Stack gap={'xs'}>
                    <Box>
                      <Text fw={"bold"} fz={'h3'} c={colors['blue-button']}>{v.name}</Text>
                      <Image w={330} h={200} fit='contain' pt={5} src={v.image.link} alt={v.name} />
                      <Text fz={'h4'} fw={'bold'} >
                        {v.name}
                      </Text>
                      <Text fz={'h6'} pb={10}>
                        Diposting: 12 Februari 2025 | Dinas Kesehatan
                      </Text>
                      <Text fz={'h4'} pb={10}>
                        {v.deskripsiSingkat}
                      </Text>
                      <Text fz={'h4'} pb={10} dangerouslySetInnerHTML={{ __html: v.deskripsiLengkap }} />
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
          mt="md"
          mb="md"
        />
      </Center>
    </Stack>
  );
}

export default Page;
