'use client'
import stateProfilePPID from '@/app/admin/(dashboard)/_state/ppid/profile_ppid/profile_PPID';
import colors from '@/con/colors';
import { Box, Center, Divider, Flex, Image, List, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBuildingCommunity, IconTargetArrow, IconTimeline, IconUser } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const allList = useProxy(stateProfilePPID)
  useShallowEffect(() => {
    allList.profile.load("edit")
  }, [])

  if (!allList.profile.data) return (
    <Stack bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <Skeleton h={40} />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Skeleton h={80} />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Paper p="xl" bg={colors['white-trans-1']}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} h={40} mb="sm" />
          ))}
        </Paper>
      </Box>
    </Stack>
  )

  const dataArray = Array.isArray(allList.profile.data)
    ? allList.profile.data
    : [allList.profile.data]

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Text ta="center" fz={{ base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.4rem" }} c={colors["blue-button"]} fw="bold">
          Profil PPID Desa Darmasaba
        </Text>
      </Box>
      {dataArray.map((item) => (
        <Box key={item.id} px={{ base: "md", md: 100 }}>
          <Paper p="xl" bg={colors['white-trans-1']} radius="lg" shadow="xl">
            <Box px={{ base: "md", md: 100 }}>
              <Flex align="center" gap={40} justify="center">
                <Image loading='lazy' src="/darmasaba-icon.png" h={{ base: 70, md: 120 }} alt="Logo Desa" />
                <Text fz={{ base: "1.5rem", md: "2rem", lg: "2.5rem", xl: "3rem" }} fw="bold">
                  Pejabat Pengelola Informasi Publik
                </Text>
              </Flex>
            </Box>
            <Divider my="lg" />

            <Box px={{ base: 0, md: 50 }} pb={40}>
              <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
                <Box px={{ base: 0, md: 50 }}>
                  <Paper bg={colors['white-trans-1']} radius="lg" shadow="sm">
                    <Stack gap="md">
                      <Center>
                        <Image
                          loading='lazy'
                          src={item.image?.link ? `${item.image.link}?t=${Date.now()}` : "/perbekel.png"}
                          w={{ base: 220, md: 330 }}
                          alt="Foto Pimpinan"
                          radius="md"
                        />
                      </Center>
                      <Paper bg={colors['blue-button']} py={25} radius="lg" className="glass3">
                        <Text ta="center" c={colors['white-1']} fw="bolder" fz={{ base: "1.5rem", md: "2rem" }}>
                          {item.name}
                        </Text>
                      </Paper>
                    </Stack>
                  </Paper>
                </Box>

                <Box>
                  <Stack gap="xl">
                    <Box>
                      <Flex align="center" gap="sm" mb="sm">
                        <IconUser size={28} />
                        <Text fz={{ base: "1.25rem", md: "1.5rem" }} fw="bold">Biografi</Text>
                      </Flex>
                      <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem" }} ta="justify" dangerouslySetInnerHTML={{ __html: item.biodata }} />
                    </Box>
                    <Box>
                      <Flex align="center" gap="sm" mb="sm">
                        <IconTimeline size={28} />
                        <Text fz={{ base: "1.25rem", md: "1.5rem" }} fw="bold">Riwayat Karir</Text>
                      </Flex>
                      <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem" }} dangerouslySetInnerHTML={{ __html: item.riwayat }} />
                    </Box>
                  </Stack>
                </Box>
              </SimpleGrid>
            </Box>

            <Box pb={40}>
              <Flex align="center" gap="sm" mb="sm">
                <IconBuildingCommunity size={28} />
                <Text fz={{ base: "1.25rem", md: "1.5rem" }} fw="bold">Pengalaman Organisasi</Text>
              </Flex>
              <List spacing="xs" size="sm">
                <Box px={20}>
                  <Text fz={{ base: "1rem", md: "1.125rem" }} ta="justify" dangerouslySetInnerHTML={{ __html: item.pengalaman }} />
                </Box>
              </List>
            </Box>

            <Box>
              <Flex align="center" gap="sm" mb="sm">
                <IconTargetArrow size={28} />
                <Text fz={{ base: "1.25rem", md: "1.5rem" }} fw="bold">Program Unggulan</Text>
              </Flex>
              <List spacing="xs" size="sm">
                <Box px={20}>
                  <Text fz={{ base: "1rem", md: "1.125rem" }} ta="justify" dangerouslySetInnerHTML={{ __html: item.unggulan }} />
                </Box>
              </List>
            </Box>
          </Paper>
        </Box>
      ))}
    </Stack>
  )
}

export default Page
