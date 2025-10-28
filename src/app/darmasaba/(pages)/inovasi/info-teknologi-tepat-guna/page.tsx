'use client'
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';

import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import infoTeknoState from '@/app/admin/(dashboard)/_state/inovasi/info-tekno';
import { IconSearch } from '@tabler/icons-react';

function Page() {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay
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
      <Box px={{ base: 'md', md: 100 }} >
        <Grid align='center'>
          <GridCol span={{ base: 12, md: 9 }}>
            <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
              Info Teknologi Tepat Guna
            </Text>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Info Teknologi'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={{ base: "50%", md: "100%" }}
            />
          </GridCol>
        </Grid>
        <Text fz={'h4'}>Desa Darmasaba berkomitmen mengembangkan teknologi tepat guna yang sesuai dengan kebutuhan masyarakat, mendukung pembangunan berkelanjutan, dan meningkatkan kualitas hidup warga.</Text>
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
                    <Text fz={'h3'} fw={'bold'}>{v.name}</Text>
                    <Box pr={'lg'} pb={10}>
                      <Text
                        size="md"
                        ta="justify"
                        lh={1} // line height biar enak dibaca
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
          onChange={(newPage) => load(newPage)} // ini penting!
          total={totalPages}
          my="md"
        />
      </Center>
    </Stack>
  );
}

export default Page;
