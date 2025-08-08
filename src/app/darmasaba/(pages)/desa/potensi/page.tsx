/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Center, Flex, Group, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useTransitionRouter } from 'next-view-transitions';
import BackButton from '../layanan/_com/BackButto';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';


function Page() {
  const router = useTransitionRouter()
  const [loading, setLoading] = useState(false)
  const state = useProxy(potensiDesaState)

  useEffect(()=> {
    state.kategoriPotensi.findMany.load()
    const loadData = async () => {
      try {
        setLoading(true)
        await state.potensiDesa.findMany.load()
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = state.potensiDesa.findMany.data
  // const kategoriData = state.kategoriPotensi.findMany.data
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} >
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Box>
          <Stack gap={0}>
            <Flex justify={"space-between"} align={"center"} >
              <Box>
                <Text fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
                  Potensi Desa
                </Text>
                <Text ta={"justify"} >
                  Temukan berbagai potensi dan keunggulan yang dimiliki Desa Darmasaba.
                </Text>
              </Box>
              <Paper radius={"md"} px={"xl"} py={5} bg={colors["blue-button"]} >
                <Flex justify={"space-between"} align={"center"} gap={"xl"}>
                  <Box>
                    <Text ta={"center"} fz={"h2"} fw={"bold"} c={"white"}>
                      {data?.filter(item => item.kategori?.nama.toLowerCase() !== 'wisata' ).length || 0}
                    </Text>
                    <Text ta={"center"} fz={"sm"} c={"white"}>Potensi</Text>
                  </Box>
                  <Box>
                    <Text ta={"center"} fz={"h2"} fw={"bold"} c={"white"}>
                      {data?.filter(item => item.kategori?.nama.toLowerCase() === 'wisata' ).length || 0}
                    </Text>
                    <Text ta={"center"} fz={"sm"} c={"white"}>Wisata</Text>
                  </Box>
                </Flex>
              </Paper>
            </Flex>
          </Stack>
        </Box>

        <SimpleGrid
          py={20}
          cols={{
            base: 1,
            sm: 3
          }}
        >
          {loading ? (
            <Center>
              <Skeleton h={250} />
            </Center>
          ) : (
            data?.map((v, k) => {
            return (
              <BackgroundImage
                key={k}
                src={v.image?.link || ''}
                h={350}
                radius={16}
                pos={"relative"}
              >
                <Box
                  style={{
                    borderRadius: 16,
                    zIndex: 0
                  }}
                  pos={"absolute"}
                  w={"100%"}
                  h={"100%"}
                  bg={colors.trans.dark[2]}
                />
                <Stack justify='space-between' h={"100%"} gap={0} p={"lg"} pos={"relative"}>
                  <Group>
                    <Paper radius={"lg"} py={7} px={10}>
                      <Text>{v.kategori?.nama}</Text>
                    </Paper>
                  </Group>
                  <Box p={"lg"}>
                    <Text
                      fw={"bold"}
                      c={"white"}
                      size={"1.8rem"}
                      style={{
                        textAlign: "center",
                      }}>{v.name}</Text>
                  </Box>
                  <Group justify="center">
                    <Button px={20} radius={"100"} size="md" bg={colors["blue-button"]}
                      onClick={() => router.push(`/darmasaba/desa/potensi/${v.id}`)}>
                      Detail
                    </Button>
                  </Group>
                </Stack>
              </BackgroundImage>
            )
          })
        )}
        </SimpleGrid>
      </Box>

    </Stack>
  );
}

export default Page;
