'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Grid, GridCol, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../_state/ppid/profile_ppid/profile_PPID';


function Page() {
  const router = useRouter()
  const allList = useProxy(stateProfilePPID)
  useShallowEffect(() => {
    allList.profile.load("edit") // Assuming "1" is your default ID, adjust as needed
  }, [])

  if (!allList.profile.data) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton radius="md" height={800} />
      </Stack>
    );
  }

  const dataArray = Array.isArray(allList.profile.data)
    ? allList.profile.data
    : [allList.profile.data];

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Grid align="center">
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} c={colors['blue-button']}>Preview Profil PPID</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
              <Button
                c="green"
                variant="light"
                leftSection={<IconEdit size={18} stroke={2} />}
                radius="md"
                onClick={() => router.push(`/admin/ppid/profil-ppid/${allList.profile.data?.id}`)}
              >
                Edit
              </Button>
          </GridCol>
        </Grid>
        {dataArray.map((item) => (
          <Paper key={item.id} p="xl" bg={'white'} withBorder radius="md" shadow="xs">
            <Box px={{ base: "sm", md: 100 }}>
              <Grid>
                <GridCol span={12}>
                  <Center>
                    <Image loading='lazy' src="/darmasaba-icon.png" w={{ base: 100, md: 150 }} alt="Logo Desa" />
                  </Center>
                </GridCol>
                <GridCol span={12}>
                  <Text ta="center" fz={{ base: "1.2rem", md: "1.8rem" }} fw="bold" c={colors['blue-button']}>
                    PROFIL PIMPINAN BADAN PUBLIK DESA DARMASABA
                  </Text>
                </GridCol>
              </Grid>
            </Box>
            <Divider my="md" color={colors['blue-button']} />
            <Box px={{ base: 0, md: 50 }} pb="xl">
              <Paper bg={colors['BG-trans']} radius="md" shadow="xs" p="lg">
                <Stack gap={0}>
                  <Center>
                    <Image
                      pt={{ base: 0, md: 60 }}
                      src={item.image?.link || "/perbekel.png"}
                      w="100%"
                      maw={300}
                      alt="Foto Profil PPID"
                      radius="md"
                      onError={(e) => { e.currentTarget.src = "/perbekel.png"; }}
                      loading='lazy'
                    />
                  </Center>
                  <Paper
                    bg={colors['blue-button']}
                    py="md"
                    px="sm"
                    radius="md"
                    className="glass3"
                    style={{ mt: -30, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  >
                    <Text ta="center" c={colors['white-1']} fw="bolder" fz={{ base: "1.2rem", md: "1.6rem" }}>
                      {item.name}
                    </Text>
                  </Paper>
                </Stack>
              </Paper>
              
              <Box mt="lg">
                <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mb={4}>Biodata</Text>
                <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" c={colors['blue-button']} style={{wordBreak: "break-word", whiteSpace: "normal"}}  dangerouslySetInnerHTML={{ __html: item.biodata }} />
              </Box>
              
              <Box mt="xl">
                <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mb={4}>Riwayat Karir</Text>
                <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" c={colors['blue-button']} style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: item.riwayat }} />
              </Box>
              
              <Box mt="xl">
                <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mb={4}>Pengalaman Organisasi</Text>
                <Box px={20}>
                  <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" c={colors['blue-button']} style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: item.pengalaman }} />
                </Box>
              </Box>
              
              <Box mt="xl" mb="lg">
                <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mb={4}>Program Kerja Unggulan</Text>
                <Box px={20}>
                  <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" c={colors['blue-button']} style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: item.unggulan }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}



export default Page;