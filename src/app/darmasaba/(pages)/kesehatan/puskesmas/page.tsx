'use client'
import puskesmasState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/puskesmas';
import colors from '@/con/colors';
import { Anchor, Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';


function Page() {
  const state = useProxy(puskesmasState)
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
            Puskesmas Darmasaba
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
      <Box px={{ base: "md", md: 100 }}>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3,
          }}
        >
          {data.map((v, k) => {
            return (
              <Paper p={"xl"} bg={colors['white-trans-1']} key={k}>
                <Stack gap={"xs"}>
                  <Text fw={"bold"} fz={"h3"}>{v.name}</Text>
                  <Image
                    src={v.image.link}
                    alt={v.name}
                  />
                  <Box>
                    <Text>Alamat: {v.alamat}</Text>
                    <Text>Telepon: {v.kontak.kontakPuskesmas}</Text>
                    <Text>Email: {v.kontak.email}</Text>
                  </Box>
                  <Anchor c={colors['blue-button']} href={`/darmasaba/kesehatan/puskesmas/${v.id}`}>Lihat Detail &gt;</Anchor>
                </Stack>
              </Paper>
            )
          })}
        </SimpleGrid>
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
