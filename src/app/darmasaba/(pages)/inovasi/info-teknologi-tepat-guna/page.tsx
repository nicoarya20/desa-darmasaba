'use client'
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useProxy } from 'valtio/utils';

import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import infoTeknoState from '@/app/admin/(dashboard)/_state/inovasi/info-tekno';
import { IconSearch } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const state = useProxy(infoTeknoState)
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

      <Box px={{ base: 'md', md: 100 }}>
        <Grid align='center'>
          <GridCol span={{ base: 12, md: 9 }}>
            <Title
              order={1}
              c={colors["blue-button"]}
              fw={"bold"}
              ta={{ base: 'center', md: 'left' }}
            >
              Info Teknologi Tepat Guna
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Info Teknologi'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={{ base: "100%", md: "100%" }}
            />
          </GridCol>
        </Grid>

        <Text pt={20} fz={{ base: 'sm', md: 'md' }} ta={{ base: 'center', md: 'left' }} lh={1.5}>
          Desa Darmasaba berkomitmen mengembangkan teknologi tepat guna yang sesuai dengan kebutuhan masyarakat,
        </Text>
        <Text fz={{ base: 'sm', md: 'md' }} ta={{ base: 'center', md: 'left' }} lh={1.5}>
          mendukung pembangunan berkelanjutan, dan meningkatkan kualitas hidup warga.
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} p={'lg'}>
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
                  <Stack gap={"xs"}>
                    <Image src={v.image.link || ''} pb={10} radius={10} alt='' loading="lazy" />
                    <Title order={3} fw={'bold'} ta="left">
                      {v.name}
                    </Title>
                    <Box pr={'lg'} pb={10}>
                      <Text
                        fz={{ base: 'xs', md: 'sm' }}
                        ta="justify"
                        lh={1.5}
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        }}
                        dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                      />
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
          onChange={(newPage) => load(newPage)}
          total={totalPages}
          my="md"
        />
      </Center>
    </Stack>
  );
}

export default Page;