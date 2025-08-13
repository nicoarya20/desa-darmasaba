/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Image, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function ProfilPerbekel() {
  const state = useProxy(stateProfileDesa.profilPerbekel)

  useEffect(() => {
    state.findUnique.load("edit")
  }, [])

  const { data, loading } = state.findUnique

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }
  return (
    <Box pb={70}>
      <Stack align='center' gap={0}>
        <Box pb={30}>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Profil Perbekel</Text>
        </Box>
      </Stack>
      <SimpleGrid
        cols={{
          base: 1,
          md: 2,
        }}
        pb={50}
      >
        <Box>
          <Paper bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
            <Stack gap={0}>
              <Image
                pt={{ base: 0, md: 120 }}
                px={"lg"}
                src={data.image?.link || "/perbekel.png"}
                sizes='100%'
                alt=''
                onError={(e) => {
                  e.currentTarget.src = "/perbekel.png";
                }}
              />
              <Paper
                bg={colors['blue-button']}
                px={"lg"}
                className="glass3"
                py={{ base: 20, md: 50 }}

              >
                <Text c={colors['white-1']} fz={{ base: "md", md: "h3" }}>Perbekel Desa Darmasaba</Text>
                <Text c={colors['white-1']} fw={"bolder"} fz={{ base: "md", md: "h2" }}>
                  I.B. Surya Prabhawa Manuaba, S.H.,M.H.,NL.P.
                </Text>
              </Paper>
            </Stack>
          </Paper>
        </Box>
        <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <Box>
            <Text fz={{ base: "1.125rem", md: "1.6rem" }} fw={'bold'}>Biodata</Text>
            <Text fz={{ base: "1rem", md: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: data.biodata }} />
          </Box>
          <Box>
            <Text fz={{ base: "1.125rem", md: "1.6rem" }} fw={'bold'}>Pengalaman</Text>
            <Text fz={{ base: "1rem", md: "1.5rem" }} dangerouslySetInnerHTML={{ __html: data.pengalaman }} />
          </Box>
        </Paper>
      </SimpleGrid >
      <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
        <Box>
          <Text fz={{ base: "1.125rem", md: "1.6rem" }} fw={'bold'}>Pengalaman Organisasi</Text>
          <Text fz={{ base: "1rem", md: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: data.pengalamanOrganisasi }} />
        </Box>
        <Box pb={20}>
          <Text fz={{ base: "1.125rem", md: "1.6rem" }} fw={'bold'}>Program Kerja Unggulan</Text>
          <Box px={20}>
            <Text fz={{ base: "1rem", md: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: data.programUnggulan }} />
          </Box>
        </Box>
      </Paper>
    </Box >
  );
}

export default ProfilPerbekel;
