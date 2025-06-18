'use client'

import colors from '@/con/colors';
import { Box, Button, Center, Divider, Grid, GridCol, Image, Paper, Stack, Text, Title } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import stateProfileDesa from '../../../_state/desa/profile';

function Page() {
  const router = useRouter();
  const snap = useSnapshot(stateProfileDesa);

  // Panggil load data sekali saat komponen mount
  useEffect(() => {
    stateProfileDesa.profilPerbekel.findUnique.load("edit");
  }, []);

  const perbekel = snap.profilPerbekel.findUnique.data;

  return (
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack gap={"xs"}>
        <Grid>
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3}>Preview Profile PPID</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button bg={colors['blue-button']} onClick={() => router.push(`/admin/desa/profile/profile-perbekel/${snap.profilPerbekel.findUnique.data?.id}`)}>
              <IconEdit size={16} />
            </Button>
          </GridCol>
        </Grid>
        {perbekel && (
          <Box  >
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box px={{ base: "md", md: 100 }}>
                <Grid>
                  <GridCol span={{ base: 12, md: 12 }}>
                    <Center>
                      <Image src={"/darmasaba-icon.png"} w={{ base: 100, md: 150 }} alt='' />
                    </Center>
                  </GridCol>
                  <GridCol span={{ base: 12, md: 12 }}>
                    <Text ta={"center"} fz={{ base: "1.2rem", md: "1.8rem" }} fw={'bold'}>PROFIL PIMPINAN BADAN PUBLIK DESA DARMASABA </Text>
                  </GridCol>
                </Grid>
              </Box>
              <Divider my={"md"} color={colors['blue-button']} />
              {/* biodata perbekel */}
              <Box px={{ base: 0, md: 50 }} pb={30}>
                <Box pb={20} px={{ base: 0, md: 50 }}>
                  <Paper bg={colors['BG-trans']} w={{ base: "100%", md: "100%" }}>
                    <Stack gap={0}>
                      <Center>
                        <Image
                          pt={{ base: 0, md: 90 }}
                          src={perbekel.image?.link || "/perbekel.png"}
                          w={{ base: 250, md: 350 }}
                          alt='Foto Profil PPID'
                          onError={(e) => {
                            e.currentTarget.src = "/perbekel.png";
                          }}
                        />
                      </Center>
                      <Paper
                        bg={colors['blue-button']}
                        py={20}
                        className="glass3"
                        px={{ base: 10, md: 10 }}

                      >
                        <Text ta={"center"} c={colors['white-1']} fw={"bolder"} fz={{ base: "1.2rem", md: "1.6rem" }}>
                        I.B. Surya Prabhawa Manuaba, S.H.,M.H.,NL.P.
                        </Text>
                      </Paper>
                    </Stack>
                  </Paper>
                </Box>
                <Box pt={10}>
                  <Box>
                    <Text fz={{ base: "1.125rem", md: "1.6rem" }} fw={'bold'}>Biodata</Text>
                    <Text fz={{ base: "1rem", md: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: perbekel.biodata }} />
                  </Box>
                  <Box>
                    <Text fz={{ base: "1.125rem", md: "1.6rem" }} fw={'bold'}>Pengalaman</Text>
                    <Text fz={{ base: "1rem", md: "1.5rem" }} dangerouslySetInnerHTML={{ __html: perbekel.pengalaman }} />
                  </Box>
                </Box>
                <Box pb={30}>
                  <Text fz={{ base: "1.125rem", md: "1.6rem" }} fw={'bold'}>Pengalaman Organisasi</Text>
                  <Box px={20}>
                    <Text fz={{ base: "1rem", md: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: perbekel.pengalamanOrganisasi }} />
                  </Box>
                </Box>
                <Box pb={20}>
                  <Text fz={{ base: "1.125rem", md: "1.6rem" }} fw={'bold'}>Program Kerja Unggulan</Text>
                  <Box px={20}>
                    <Text fz={{ base: "1rem", md: "1.5rem" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: perbekel.programUnggulan }} />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

export default Page;
