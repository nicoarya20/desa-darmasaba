'use client'
import colors from '@/con/colors';
import { Box, Center, Image, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
function SemuaPerbekel() {
const state = useProxy(stateProfileDesa.mantanPerbekel)

useShallowEffect(() => {
  state.findMany.load()
}, [])

const {data, loading} = state.findMany

if (loading || !data) {
  return (
    <Box py={10}>
      <Skeleton h={500} />
    </Box>
  )
}

  return (
    <Box pb={50}>
      <Stack align='center'>
        <Box pb={30}>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={{ base: "h1", md: "2.5rem" }}>Perbekel Dari Masa Ke Masa</Text>
        </Box>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3,
          }}
        >
          {data.map((v, k) => {
            return (
              <Box key={k}>
                <Paper h={620} mb={50} radius={26} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                  <Box>
                    <Center>
                      <Image src={v.image?.link} alt='' />
                    </Center>
                  </Box>
                  <Box>
                    <Stack gap={"sm"} py={10}>
                      <Text ta={"center"} fw={"bold"} fz={{ base: "h3", md: "h3" }}>{v.nama}</Text>
                      <Text ta={"center"} fz={{ base: "h5", md: "h4" }}>{v.daerah}</Text>
                      <Text ta={"center"} fz={{ base: "h5", md: "h4" }}>{v.periode}</Text>
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            )
          })
          }
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default SemuaPerbekel;
