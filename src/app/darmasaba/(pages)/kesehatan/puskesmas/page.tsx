import colors from '@/con/colors';
import { Stack, Box, Paper, Text, BackgroundImage, SimpleGrid, Title, Flex } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Puskesmas Darmasaba
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Box>
            <Paper p={"xl"} bg={colors['white-trans-1']}>
              <Box pb={30}>
                <BackgroundImage
                  pb={30}
                  radius={16}
                  h={{ base: 250, md: 500 }}
                  src='/api/img/posyandu.png'
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
                  }} fw={'bold'} fz={{ base: 'md', md: 'h3' }} c={colors['white-1']}>Puskesmas Darmasaba</Text>
                  <Text style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 15,
                  }} fw={'bold'} fz={{ base: 'md', md: 'h4' }} c={colors['white-1']}>Jl. Raya Darmasaba No.45, Badung, Bali</Text>
                </BackgroundImage>
                <SimpleGrid
                  py={20}
                  cols={{
                    base: 1,
                    md: 2
                  }}>
                  <Box>
                    <Stack>
                      <Title order={3}>Jam Operasional</Title>
                      <Box>
                        <Flex justify={'space-between'} align={'center'}>
                          <Box>
                            <Text>Senin - Kamis</Text>
                            <Text>Jumat</Text>
                            <Text>Sabtu</Text>
                            <Text> Minggu & Libur</Text>
                          </Box>
                          <Box>
                            <Text>08:00 - 15:00 WITA</Text>
                            <Text>08:00 - 15:00 WITA</Text>
                            <Text>08:00 - 15:00 WITA</Text>
                            <Text>Tutp (UGD 24 JAM)</Text>
                          </Box>
                        </Flex>
                      </Box>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack>
                      <Title order={3}>Jam Operasional</Title>
                      <Box>
                        <Flex justify={'space-between'} align={'center'}>
                          <Box>
                            <Text>Senin - Kamis</Text>
                            <Text>Jumat</Text>
                            <Text>Sabtu</Text>
                            <Text> Minggu & Libur</Text>
                          </Box>
                          <Box>
                            <Text>08:00 - 15:00 WITA</Text>
                            <Text>08:00 - 15:00 WITA</Text>
                            <Text>08:00 - 15:00 WITA</Text>
                            <Text>Tutp (UGD 24 JAM)</Text>
                          </Box>
                        </Flex>
                      </Box>
                    </Stack>
                  </Box>
                  <Box>

                  </Box>
                </SimpleGrid>
              </Box>
              <Box>
                <Paper p={"xl"} bg={'#B1C5F2'}>
                  <SimpleGrid
                    cols={{
                      base: 1,
                      md: 2
                    }}>
                    <Paper p={"xl"} bg={colors['white-trans-1']}>
                      <Text fw={"bold"} fz={'h3'} ta={'center'}>Poliklinik Umum</Text>
                      <Text ta={'center'} fz={65} fw={'bold'} c={colors['blue-button']}>26</Text>
                    </Paper>
                    <Paper p={"xl"} bg={colors['white-trans-1']}>
                      <Text ta={'center'} fz={'h3'} fw={"bold"}>Poli Gigi</Text>
                      <Text ta={'center'} fz={65} fw={'bold'} c={colors['blue-button']}>26</Text>
                    </Paper>
                  </SimpleGrid>
                </Paper>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
