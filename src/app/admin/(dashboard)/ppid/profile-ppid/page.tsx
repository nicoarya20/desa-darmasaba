'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Flex, Grid, GridCol, Image, List, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../_state/ppid/profile_ppid/profile_PPID';


function Page() {
  const router = useRouter()
  const allList = useProxy(stateProfilePPID)
  useShallowEffect(() => {
    allList.profile.load("1") // Assuming "1" is your default ID, adjust as needed
  }, [])

  if (!allList.profile.data) {
    return <Stack>
      <Skeleton radius={10} h={800} />
    </Stack>
  }

  const dataArray = Array.isArray(allList.profile.data)
    ? allList.profile.data
    : [allList.profile.data];

  return (
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack gap={"xs"}>
        <Grid>
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3}>List Profile PPID</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button bg={colors['blue-button']} onClick={() => router.push(`/admin/ppid/profile-ppid/${allList.profile.data?.id}`)}>
              <IconEdit size={16} />
            </Button>
          </GridCol>
        </Grid>
        {dataArray.map((item) => (
          <Box key={item.id} px={{ base: "md", md: 100 }}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box px={{ base: "md", md: 100 }}>
                <Flex align={"center"} gap={50}>
                  <Image src={"/api/img/darmasaba-icon.png"} h={{ base: 80, md: 150 }} alt='' />
                  <Text fz={{ base: "1.4rem", md: "1.6rem", lg: "2rem", xl: "2.5rem" }} fw={'bold'}>PROFIL PIMPINAN BADAN PUBLIK DESA DARMASABA </Text>
                </Flex>
              </Box>
              <Divider my={"md"} />
              {/* biodata perbekel */}
              <Box px={{ base: 0, md: 50 }} pb={30}>
                <Box px={{ base: 0, md: 50 }}>
                  <Paper bg={colors['BG-trans']} w={{ base: "100%", md: "100%" }}>
                    <Stack gap={0}>
                      <Center>
                        <Image
                          pt={{ base: 0, md: 90 }}
                          src={item.image?.link}
                          w={{ base: 250, md: 350 }}
                          alt='Foto Profil PPID'
                          onError={(e) => {
                            e.currentTarget.src = "/perbekel.png";
                          }}
                        />
                      </Center>
                      <Paper
                        bg={colors['blue-button']}
                        py={30}
                        className="glass3"
                        px={{ base: 20, md: 20 }}

                      >
                        <Text ta={"center"} c={colors['white-1']} fw={"bolder"} fz={{ base: "1.5rem", md: "1.5rem" }}>
                          {item.name}
                        </Text>
                      </Paper>
                    </Stack>
                  </Paper>
                </Box>
                <Box pt={10}>
                  <Box>
                    <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Biodata</Text>
                    <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: item.biodata }} />
                  </Box>
                  <Box>
                    <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Riwayat Karir</Text>
                    <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} dangerouslySetInnerHTML={{ __html: item.riwayat }} />
                  </Box>
                </Box>
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
    </Paper>
  )
}



export default Page;