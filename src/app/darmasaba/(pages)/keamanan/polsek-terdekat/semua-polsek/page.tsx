'use client'
import polsekTerdekatState from '@/app/admin/(dashboard)/_state/keamanan/polsek-terdekat';
import colors from '@/con/colors';
import { Box, Button, Center, Grid, GridCol, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconNavigation, IconSearch } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';
import { useDebouncedValue } from '@mantine/hooks';

function Page() {
  const state = useProxy(polsekTerdekatState);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay
  const router = useRouter()

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
            Semua Polsek Terdekat
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 3 }}>
          <TextInput
            radius={"lg"}
            placeholder='Cari Polsek'
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
                  <Text fw={"bold"} fz={"h3"}>{v.nama}</Text>
                  <Text>Alamat: {v.alamat}</Text>
                  <Text>Jarak: {v.jarakKeDesa}</Text>
                  <Text>Telepon: {v.nomorTelepon}</Text>
                  <Text>Jam Operasional: {v.jamOperasional}</Text>
                  <Box pt={20}>
                    <iframe style={{ border: 2, width: "100%" }} src={v.embedMapUrl} width="550" height="300" ></iframe>
                  </Box>
                  <Box pt={20}>
                    <Button onClick={() => router.push(v.linkPetunjukArah)} fullWidth bg={colors["blue-button"]} radius={10} leftSection={<IconNavigation size={20} />}>Petunjuk Arah</Button>
                  </Box>
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
