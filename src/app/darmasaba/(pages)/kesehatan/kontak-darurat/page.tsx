'use client'
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import { useState } from 'react';

import { useShallowEffect } from '@mantine/hooks';
import kontakDarurat from '@/app/admin/(dashboard)/_state/kesehatan/kontak-darurat/kontakDarurat';
import { IconSearch } from '@tabler/icons-react';

function Page() {
  const state = useProxy(kontakDarurat)
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
            Penanganan Darurat
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 3 }}>
          <TextInput
            radius={"lg"}
            placeholder='Cari Penanganan Darurat'
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
            pb={10}
            cols={{
              base: 1,
              md: 3,
            }}>
            {data.map((v, k) => {
              return (
                <Paper radius={10} key={k} bg={colors["white-trans-1"]}>
                  <Stack gap={'xs'}>
                    <Center py={40}>
                      <Image
                        src={v.image.link}
                        alt={v.name}
                        w={200}
                        h={200}
                        fit='contain'
                      />
                    </Center>
                    <Box px={'lg'}>
                      <Box pb={20}>
                        <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                          {v.name}
                        </Text>
                        <Box px={10}>
                          <Text fz={"h4"} dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
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
          mt="md"
          mb="md"
        />
      </Center>
    </Stack>
  );
}

export default Page;
