'use client'

import colors from '@/con/colors';
import { Box, Button, Center, Divider, Grid, GridCol, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import stateProfileDesa from '../../../_state/desa/profile';

function Page() {
  const router = useRouter();
  const snap = useSnapshot(stateProfileDesa);

  // Load data saat mount
  useEffect(() => {
    stateProfileDesa.profilPerbekel.findUnique.load("edit");
  }, []);

  const perbekel = snap.profilPerbekel.findUnique.data;

  if (!perbekel) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton radius="md" height={800} />
      </Stack>
    );
  }

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        {/* Header + tombol edit */}
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
                onClick={() => router.push(`/admin/desa/profile/profile-perbekel/${perbekel.id}`)}
              >
                Edit
              </Button>
          </GridCol>
        </Grid>

        {/* Card Profil */}
        <Paper p="xl" bg={colors['white-1']} withBorder radius="md" shadow="xs">
          <Box px={{ base: "sm", md: 100 }}>
            <Grid>
              <GridCol span={12}>
                <Center>
                  <Image loading='lazy' src="/darmasaba-icon.png" w={{ base: 100, md: 150 }} alt="Logo Desa" />
                </Center>
              </GridCol>
              <GridCol span={12}>
                <Text ta="center" fz={{ base: "1.2rem", md: "1.8rem" }} fw="bold" c={colors['blue-button']}>
                  Profil Pimpinan Badan Publik Desa Darmasaba
                </Text>
              </GridCol>
            </Grid>
          </Box>
          <Divider my="md" color={colors['blue-button']} />

          <Stack gap={0} px={{ base: 0, md: 50 }} pb="xl">
            <Center>
              <Image
                pt={{ base: 0, md: 60 }}
                src={perbekel.image?.link || "/perbekel.png"}
                w={{ base: 250, md: 350 }}
                alt="Foto Profil Perbekel"
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
              I.B. Surya Prabhawa Manuaba, S.H., M.H.
              </Text>
            </Paper>
          </Stack>

          {/* Biodata & Info */}
          <Box mt="lg">
            <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mb={4}>Biodata</Text>
            <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: perbekel.biodata }} />

            <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mt="md" mb={4}>Pengalaman</Text>
            <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: perbekel.pengalaman }} />

            <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mt="md" mb={4}>Pengalaman Organisasi</Text>
            <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: perbekel.pengalamanOrganisasi }} />

            <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mt="md" mb={4}>Program Kerja Unggulan</Text>
            <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: perbekel.programUnggulan }} />
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default Page;
