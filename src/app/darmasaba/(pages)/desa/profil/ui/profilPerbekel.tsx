/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Divider, Image, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconBriefcase, IconTargetArrow, IconUser, IconUsers } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function ProfilPerbekel() {
  const state = useProxy(stateProfileDesa.profilPerbekel);

  useEffect(() => {
    state.findUnique.load("edit");
  }, []);

  const { data, loading } = state.findUnique;

  if (loading || !data) {
    return (
      <Box py={20} px="md">
        <Skeleton h={500} radius="lg" />
      </Box>
    );
  }

  return (
    <Box px="md">
      {/* ===== PAGE TITLE ===== */}
      <Stack align="center" gap={0} mb={40}>
        <Title
          order={1}
          c={colors['blue-button']}
          ta="center"
          style={{ letterSpacing: "0.5px" }}
        >
          Profil Perbekel
        </Title>
        <Divider w={120} size="sm" color={colors['blue-button']} mt={10} />
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" pb={50}>
        {/* ========== FOTO PERBEKEL ========== */}
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

              {/* ===== NAMA DAN JABATAN ===== */}
              <Paper
                bg={colors['blue-button']}
                px="lg"
                radius="0 0 var(--mantine-radius-xl) var(--mantine-radius-xl)"
                className="glass3"
                py={{ base: 20, md: 50 }}
              >
                <Title order={3} c={colors['white-1']}>
                  Perbekel Desa Darmasaba
                </Title>

                <Title
                  order={2}
                  c={colors['white-1']}
                  mt={8}
                >
                  {"I.B. Surya Prabhawa Manuaba, S.H.,M.H.,NL.P."}
                </Title>
              </Paper>
            </Stack>
          </Paper>
        </Box>

        {/* ========== BIODATA & PENGALAMAN ========== */}
        <Paper
          p="xl"
          bg={colors['white-trans-1']}
          w="100%"
          radius="xl"
          shadow="md"
          withBorder
        >
          <Stack gap="xl">

            {/* ===== BIODATA ===== */}
            <Box>
              <Stack gap={6}>
                <Stack align="center" gap={6}>
                  <IconUser size={22} />
                  <Title order={3}>Biodata</Title>
                </Stack>

                <Text
                  fz={{ base: "sm", md: "md" }}
                  ta="justify"
                  lh={1.7}
                  dangerouslySetInnerHTML={{ __html: data.biodata }}
                  style={{ wordBreak: "break-word" }}
                />
              </Stack>
            </Box>

            {/* ===== PENGALAMAN ===== */}
            <Box>
              <Stack gap={6}>
                <Stack align="center" gap={6}>
                  <IconBriefcase size={22} />
                  <Title order={3}>Pengalaman</Title>
                </Stack>

                <Text
                  fz={{ base: "sm", md: "md" }}
                  ta="left"
                  lh={1.7}
                  dangerouslySetInnerHTML={{ __html: data.pengalaman }}
                  style={{ wordBreak: "break-word" }}
                />
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* ========== ORGANISASI & PROGRAM UNGGULAN ========== */}
      <Paper
        p="xl"
        bg={colors['white-trans-1']}
        w="100%"
        radius="xl"
        shadow="md"
        withBorder
      >
        <Stack gap="xl">

          {/* ===== PENGALAMAN ORGANISASI ===== */}
          <Box>
            <Stack align="center" gap={6}>
              <IconUsers size={22} />
              <Title order={3}>Pengalaman Organisasi</Title>
            </Stack>

            <Text
              fz={{ base: "sm", md: "md" }}
              ta="justify"
              lh={1.7}
              dangerouslySetInnerHTML={{ __html: data.pengalamanOrganisasi }}
              style={{ wordBreak: "break-word" }}
            />
          </Box>

          {/* ===== PROGRAM UNGGULAN ===== */}
          <Box>
            <Stack align="center" gap={6} mb={6}>
              <IconTargetArrow size={22} />
              <Title order={3}>Program Kerja Unggulan</Title>
            </Stack>

            <Box px={10}>
              <Text
                fz={{ base: "sm", md: "md" }}
                ta="justify"
                lh={1.7}
                dangerouslySetInnerHTML={{ __html: data.programUnggulan }}
                style={{ wordBreak: "break-word" }}
              />
            </Box>
          </Box>

        </Stack>
      </Paper>
    </Box>
  );
}

export default ProfilPerbekel;
