/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Image, Paper, SimpleGrid, Skeleton, Stack, Text, Divider, Tooltip } from '@mantine/core';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import { IconUser, IconBriefcase, IconUsers, IconTargetArrow } from '@tabler/icons-react';

function ProfilPerbekel() {
  const state = useProxy(stateProfileDesa.profilPerbekel)

  useEffect(() => {
    state.findUnique.load("edit")
  }, [])

  const { data, loading } = state.findUnique

  if (loading || !data) {
    return (
      <Box py={20} px="md">
        <Skeleton h={500} radius="lg" />
      </Box>
    )
  }

  return (
    <Box pb={80} px="md">
      <Stack align="center" gap={0} mb={40}>
        <Text 
          c={colors['blue-button']} 
          ta="center" 
          fw="bold" 
          fz={{ base: "2rem", md: "2.8rem" }}
          style={{ letterSpacing: "0.5px" }}
        >
          Profil Perbekel
        </Text>
        <Divider w={120} size="sm" color={colors['blue-button']} mt={10} />
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" pb={50}>
        <Box>
          <Paper 
            bg={colors['white-trans-1']} 
            w="100%" 
            radius="xl" 
            shadow="md" 
            withBorder
          >
            <Stack gap={0}>
              <Image
                pt={{ base: 0, md: 100 }}
                px="lg"
                src={data.image?.link || "/perbekel.png"}
                alt="Foto Perbekel"
                radius="lg"
                onError={(e) => {
                  e.currentTarget.src = "/perbekel.png";
                }}
                loading="lazy"
              />
              <Paper
                bg={colors['blue-button']}
                px="lg"
                radius="0 0 var(--mantine-radius-xl) var(--mantine-radius-xl)"
                className="glass3"
                py={{ base: 20, md: 50 }}
              >
                <Text c={colors['white-1']} fz={{ base: "lg", md: "h3" }}>
                  Perbekel Desa Darmasaba
                </Text>
                <Text 
                  c={colors['white-1']} 
                  fw="bolder" 
                  fz={{ base: "xl", md: "h2" }}
                  mt={8}
                >
                  {"I.B. Surya Prabhawa Manuaba, S.H.,M.H.,NL.P."}
                </Text>
              </Paper>
            </Stack>
          </Paper>
        </Box>

        <Paper 
          p="xl" 
          bg={colors['white-trans-1']} 
          w="100%" 
          radius="xl" 
          shadow="md" 
          withBorder
        >
          <Stack gap="xl">
            <Box>
              <Tooltip label="Informasi pribadi perbekel" withArrow>
                <Stack gap={6}>
                  <Stack align="center" gap={6}>
                    <IconUser size={22} color={colors['blue-button']} />
                    <Text fz={{ base: "1.2rem", md: "1.5rem" }} fw="bold">Biodata</Text>
                  </Stack>
                  <Text 
                    fz={{ base: "1rem", md: "1.2rem" }} 
                    ta="justify" 
                    lh={1.6}
                    dangerouslySetInnerHTML={{ __html: data.biodata }} 
                    style={{wordBreak: "break-word", whiteSpace: "normal"}}
                  />
                </Stack>
              </Tooltip>
            </Box>

            <Box>
              <Tooltip label="Pengalaman kerja perbekel" withArrow>
                <Stack gap={6}>
                  <Stack align="center" gap={6}>
                    <IconBriefcase size={22} color={colors['blue-button']} />
                    <Text fz={{ base: "1.2rem", md: "1.5rem" }} fw="bold">Pengalaman</Text>
                  </Stack>
                  <Text 
                    fz={{ base: "1rem", md: "1.2rem" }} 
                    ta="justify" 
                    lh={1.6}
                    dangerouslySetInnerHTML={{ __html: data.pengalaman }} 
                    style={{wordBreak: "break-word", whiteSpace: "normal"}}
                  />
                </Stack>
              </Tooltip>
            </Box>
          </Stack>
        </Paper>
      </SimpleGrid>

      <Paper 
        p="xl" 
        bg={colors['white-trans-1']} 
        w="100%" 
        radius="xl" 
        shadow="md" 
        withBorder
      >
        <Stack gap="xl">
          <Box>
            <Stack align="center" gap={6} >
              <IconUsers size={22} color={colors['blue-button']} />
              <Text fz={{ base: "1.2rem", md: "1.5rem" }} fw="bold">Pengalaman Organisasi</Text>
            </Stack>
            <Text 
              fz={{ base: "1rem", md: "1.2rem" }} 
              ta="justify" 
              lh={1.6}
              dangerouslySetInnerHTML={{ __html: data.pengalamanOrganisasi }} 
              style={{wordBreak: "break-word", whiteSpace: "normal"}}
            />
          </Box>

          <Box>
            <Stack align="center" gap={6}  mb={6}>
              <IconTargetArrow size={22} color={colors['blue-button']} />
              <Text fz={{ base: "1.2rem", md: "1.5rem" }} fw="bold">Program Kerja Unggulan</Text>
            </Stack>
            <Box px={10}>
              <Text 
                fz={{ base: "1rem", md: "1.2rem" }} 
                ta="justify" 
                lh={1.6}
                dangerouslySetInnerHTML={{ __html: data.programUnggulan }} 
                style={{wordBreak: "break-word", whiteSpace: "normal"}}
              />
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ProfilPerbekel;
