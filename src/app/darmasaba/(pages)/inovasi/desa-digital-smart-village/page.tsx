'use client'
import colors from '@/con/colors';
import { Stack, Box, Text, Paper, SimpleGrid, Image, Skeleton, Center, Pagination, Grid, GridCol, TextInput, Button } from '@mantine/core';
import React, { useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import desaDigitalState from '@/app/admin/(dashboard)/_state/inovasi/desa-digital';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

function Page() {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay
  const state = useProxy(desaDigitalState)
  const router = useRouter()
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
        <Text pt={20} fz={'md'}>Menjadikan Desa Darmasaba pusat inovasi digital untuk pemberdayaan masyarakat</Text>
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
                <Paper
                  key={k}
                  radius="xl"
                  shadow="md"
                  withBorder
                  p="lg"
                  bg={colors['white-trans-1']}
                  style={{
                    transition: 'all 200ms ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between', // ✅ biar button selalu di bawah
                    height: '100%', // ✅ bikin tinggi seragam
                  }}
                >
                  <Stack gap={"xs"}>
                    <Box
                      style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Image
                        src={v.image.link}
                        alt={v.name}
                        fit="cover"
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    </Box>
                    <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.name}</Text>
                    <Box>
                      <Text lineClamp={3} truncate="end" fz={"md"} style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
                    </Box>
                  </Stack>

                  <Center mt="md">
                    <Button
                      bg={colors['blue-button']}
                      radius="lg"
                      w="100%"
                      onClick={() => router.push(`/darmasaba/inovasi/desa-digital-smart-village/${v.id}`)}
                    >
                      Detail
                    </Button>
                  </Center>
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
