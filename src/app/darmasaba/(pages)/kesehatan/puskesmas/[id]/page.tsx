'use client'
import puskesmasState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/puskesmas';
import colors from '@/con/colors';
import { BackgroundImage, Box, Grid, GridCol, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(puskesmasState)
  const params = useParams()

  useShallowEffect(() => {
    state.findUnique.load(params.id as string)
  }, [])

  if (!state.findUnique.data) {
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
      <Stack gap={'lg'} px={{ base: 'md', md: 100 }}>
        <Box>
          <Paper p={"xl"} bg={colors['white-trans-1']}>
            <Box pb={30}>
              <BackgroundImage
                pb={30}
                radius={16}
                h={{ base: 250, md: 500 }}
                src={state.findUnique.data.image.link}
                style={{ position: 'relative' }}
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
                <Text style={{
                  position: 'absolute',
                  bottom: 35,
                  left: 15,
                }} fw={'bold'} fz={{ base: 'md', md: 'h3' }} c={colors['white-1']}>{state.findUnique.data.name}</Text>
                <Text style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 15,
                }} fw={'bold'} fz={{ base: 'md', md: 'h4' }} c={colors['white-1']}>{state.findUnique.data.alamat}</Text>
              </BackgroundImage>
              <Grid
                py={20}>
                <GridCol span={{ base: 12, md: 6 }}>
                  <Box>
                    <Stack>
                      <Title order={3}>Informasi</Title>
                      <Box>
                        <Text>Alamat: {state.findUnique.data.alamat}</Text>
                        <Text>Telepon: {state.findUnique.data.kontak.kontakPuskesmas}</Text>
                        <Text>Email: {state.findUnique.data.kontak.email}</Text>
                      </Box>
                      <Title order={3}>Jam Operasional</Title>
                      <Box>
                        <Text pb={10} fz={'h4'} fw={"bold"}>
                          Senin - Kamis: <Text span fz={'h4'}>{state.findUnique.data?.jam.workDays} - {state.findUnique.data?.jam.weekDays}</Text>
                        </Text>
                      </Box>
                    </Stack>
                  </Box>
                </GridCol>
                <GridCol span={{ base: 12, md: 6 }}>
                  <Box>
                    <Paper p={"xl"} bg={'#B1C5F2'}>
                      <SimpleGrid
                        cols={{
                          base: 1,
                          md: 2
                        }}>
                        <Paper p={"xl"} bg={colors['white-trans-1']}>
                          <Text fw={"bold"} fz={'h3'} ta={'center'}>Poliklinik Umum</Text>
                          <Text ta={'center'} fz={{ base: 45, md: 65 }} fw={'bold'} c={colors['blue-button']}>26</Text>
                        </Paper>
                        <Paper p={"xl"} bg={colors['white-trans-1']}>
                          <Text ta={'center'} fz={'h3'} fw={"bold"}>Poli Gigi</Text>
                          <Text ta={'center'} fz={{ base: 45, md: 65 }} fw={'bold'} c={colors['blue-button']}>26</Text>
                        </Paper>
                      </SimpleGrid>
                    </Paper>
                  </Box>
                </GridCol>
                <Box>
                </Box>
              </Grid>
            </Box>

          </Paper>
        </Box>
      </Stack>
    </Stack>
  );
}

export default Page;
