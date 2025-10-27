'use client'
import colors from '@/con/colors';
import { Stack, Box, Text, Paper, SimpleGrid, Image, Skeleton, Center, Pagination, Grid, GridCol, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import desaDigitalState from '@/app/admin/(dashboard)/_state/inovasi/desa-digital';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';

function Page() {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay
  const state = useProxy(desaDigitalState)
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany

  useShallowEffect(() => {
    load(page, 3, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
      <Grid align='center'>
          <GridCol span={{ base: 12, md: 9 }}>
            <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
            Desa Digital / Smart Village
            </Text>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Produk'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={{ base: "50%", md: "100%" }}
            />
          </GridCol>
        </Grid>
        <Text fz={'md'}>Menjadikan Desa Darmasaba pusat inovasi digital untuk pemberdayaan masyarakat</Text>
        <Text fz={'md'}>dan peningkatan ekonomi berbasis teknologi.</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 3
            }}
          >
            {filteredData.map((v, k) => {
              return (
                <Paper p={'xl'} key={k}>
                  <Image src={v.image.link? v.image.link : ''} pb={10} radius={10} alt='' loading="lazy"/>
                  <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.name}</Text>
                  <Box>
                    <Text fz={"md"} style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
                  </Box>
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
