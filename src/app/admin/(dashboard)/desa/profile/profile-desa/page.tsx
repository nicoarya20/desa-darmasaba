'use client'
import colors from '@/con/colors';
import { Paper, Stack, Grid, GridCol, Title, Button, Box, Text, Center, Image, SimpleGrid } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';

function Page() {
  const router = useRouter()
  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"22"}>
        <Grid>
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={2}>Preview Profile Desa</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button bg={colors['blue-button']} onClick={() => router.push('/admin/desa/profile/edit/sejarah_desa')}>
              <IconEdit size={16} />
            </Button>
          </GridCol>
        </Grid>
        {/* Sejarah Desa */}
        <Box>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box pb={30}>
                <Center>
                  <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                </Center>
                <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Sejarah Desa</Text>
              </Box>
              <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
                  Test
                </Text>
              </Paper>
            </Paper>
          </Stack>
        </Box>
        {/* Visi Misi Desa */}
        <Box>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box pb={30}>
                <Center>
                  <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                </Center>
              </Box>
              <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Visi Desa</Text>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
                  Test
                </Text>
              </Paper>
              <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Misi Desa</Text>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
                  Test
                </Text>
              </Paper>
            </Paper>
          </Stack>
        </Box>
        {/* Lambang Desa */}
        <Box>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box pb={30}>
                <Center>
                  <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                </Center>
                <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Lambang Desa</Text>
              </Box>
              <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
                  Test
                </Text>
              </Paper>
            </Paper>
          </Stack>
        </Box>
        {/* Maskot Desa */}
        <Box>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box pb={30}>
                <Center>
                  <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                </Center>
                <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Maskot Desa</Text>
              </Box>
              <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
                  Test
                </Text>
              </Paper>
              <SimpleGrid
                cols={{
                  base: 1,
                  md: 2,
                }}
              >
                <Center>
                  <Box>
                    <Paper p={"lg"}>
                      <Image src={"/api/img/pohonpudak.png"} alt="" w={{ base: 150, md: 250 }} />
                      <Text ta={"center"} fw={"bold"} c={colors["blue-button"]} fz={{ base: "md", md: "h3" }}>Pohon Pudak</Text>
                    </Paper>
                  </Box>
                </Center>
                <Center>
                  <Box>
                    <Paper p={"lg"}>
                      <Image src={"/api/img/bungapudak.png"} alt="" w={{ base: 150, md: 250 }} />
                      <Text ta={"center"} fw={"bold"} c={colors["blue-button"]} fz={{ base: "md", md: "h3" }}>Bunga Pudak</Text>
                    </Paper>
                  </Box>
                </Center>
              </SimpleGrid>
              <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
                  Test
                </Text>
              </Paper>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default Page;
