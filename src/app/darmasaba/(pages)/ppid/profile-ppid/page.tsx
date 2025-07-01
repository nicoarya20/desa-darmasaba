'use client'
import stateProfilePPID from '@/app/admin/(dashboard)/_state/ppid/profile_ppid/profile_PPID';
import colors from '@/con/colors';
import { Box, Center, Divider, Flex, Image, List, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const allList = useProxy(stateProfilePPID)
  useShallowEffect(() => {
    allList.profile.load("edit") // Assuming "1" is your default ID, adjust as needed
  }, [])

  if (!allList.profile.data) return <Stack bg={colors.Bg} py={"xl"} gap={"22"}>
    <Box px={{ base: 'md', md: 100 }}>
      <Skeleton style={{backgroundColor: colors.Bg}} h={40} />
    </Box>
    <Box px={{ base: 'md', md: 100 }}>
      <Skeleton h={80} />
    </Box>
    <Box px={{ base: "md", md: 100 }}>
      <Paper p={"xl"} bg={colors['white-trans-1']}>
        {Array.from({ length: 10 }).map((v, k) =>
          <Skeleton key={k} h={40} />
        )}
      </Paper>
    </Box>
  </Stack>

  const dataArray = Array.isArray(allList.profile.data)
    ? allList.profile.data
    : [allList.profile.data];

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Text ta={"center"} fz={{ base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.4rem" }} c={colors["blue-button"]} fw={"bold"}>
          Profil Singkat PPID Desa Darmasaba
        </Text>
      </Box>
      {dataArray.map((item) => (
        <Box key={item.id} px={{ base: "md", md: 100 }}>
          <Paper p={"xl"} bg={colors['white-trans-1']}>
            <Box px={{ base: "md", md: 100 }}>
              <Flex align={"center"} gap={50}>
                <Image src={"/darmasaba-icon.png"} h={{ base: 80, md: 150 }} alt='' />
                <Text fz={{ base: "1.4rem", md: "2rem", lg: "2.5rem", xl: "3rem" }} fw={'bold'}>PROFIL PIMPINAN BADAN PUBLIK DESA DARMASABA </Text>
              </Flex>
            </Box>
            <Divider my={"md"} />
            {/* biodata perbekel */}
            <Box px={{ base: 0, md: 50 }} pb={30}>
              <SimpleGrid
                cols={{
                  base: 1,
                  md: 1,
                  lg: 1,
                  xl: 2,
                }}
              >
                <Box px={{ base: 0, md: 50 }}>
                  <Paper bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                    <Stack gap={0}>
                      <Center>
                        <Image pt={{ base: 0, md: 90 }} src={item.imageUrl ? `${item.imageUrl}?t=${Date.now()}` : "/api/img/perbekel.png"} w={{ base: 250, md: 355 }} alt='' />
                      </Center>
                      <Paper
                        bg={colors['blue-button']}
                        py={30}
                        className="glass3"
                        px={{ base: 20, md: 20 }}

                      >
                        <Text ta={"center"} c={colors['white-1']} fw={"bolder"} fz={{ base: "1.5rem", md: "2.125rem", lg: "2.25rem", xl: "1.5rem" }}>
                          {item.name}
                        </Text>
                      </Paper>
                    </Stack>
                  </Paper>
                </Box>
                <Box>
                  <Box>
                    <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Biodata</Text>
                    <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: item.biodata }} />
                  </Box>
                  <Box>
                    <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Riwayat Karir</Text>
                    <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} dangerouslySetInnerHTML={{ __html: item.riwayat }} />
                  </Box>
                </Box>
              </SimpleGrid>
            </Box>
            <Box pb={30}>
              <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Pengalaman Organisasi</Text>
              <List>
                <Box px={20}>
                  <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: item.pengalaman }} />
                </Box>
              </List>
            </Box>
            <Box pb={20}>
              <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Program Kerja Unggulan</Text>
              <List>
                <Box px={20}>
                  <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: item.unggulan }} />
                </Box>
              </List>
            </Box>
          </Paper>
        </Box>

      ))}
    </Stack>
  );
}

export default Page;
