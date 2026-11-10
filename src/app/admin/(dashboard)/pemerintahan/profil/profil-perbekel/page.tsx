'use client'

import colors from '@/con/colors';
import { Box, Button, Center, Divider, Grid, GridCol, Group, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
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
        <Group justify="space-between">
          <Title order={2} c={colors['blue-button']} lh={1.2}>Profil Perbekel</Title>
          <Button
            c="green"
            variant="light"
            leftSection={<IconEdit size={18} stroke={2} />}
            radius="md"
            onClick={() => router.push(`/admin/pemerintahan/profil/profil-perbekel/${perbekel.id}`)}
          >
            Edit
          </Button>
        </Group>

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
                <Text
                  ta="center"
                  fz={{ base: 'sm', md: 'xl' }}
                  fw="bold"
                  c={colors['blue-button']}
                  lh={{ base: 1.45, md: 1.45 }}
                >
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
              <Text
                ta="center"
                c={colors['white-1']}
                fw="bolder"
                fz={{ base: 'md', md: 'lg' }}
                lh={{ base: 1.4, md: 1.4 }}
              >
                I.B. Surya Prabhawa Manuaba, S.H., M.H.
              </Text>
            </Paper>
          </Stack>

          {/* Biodata & Info */}
          <Box mt="lg">
            <Title order={3} lh={1.2} mb={4} />
            <Text
              fz={{ base: 'sm', md: 'md' }}
              lh={{ base: 1.6, md: 1.6 }}
              ta="justify"
              style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              dangerouslySetInnerHTML={{ __html: perbekel.biodata }}
            />

            <Title order={3} lh={1.2} mt="md" mb={4} />
            <Text
              fz={{ base: 'sm', md: 'md' }}
              lh={{ base: 1.6, md: 1.6 }}
              ta="justify"
              style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              dangerouslySetInnerHTML={{ __html: perbekel.pengalaman }}
            />

            <Title order={3} lh={1.2} mt="md" mb={4} />
            <Text
              fz={{ base: 'sm', md: 'md' }}
              lh={{ base: 1.6, md: 1.6 }}
              ta="justify"
              style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              dangerouslySetInnerHTML={{ __html: perbekel.pengalamanOrganisasi }}
            />

            <Title order={3} lh={1.2} mt="md" mb={4} />
            <Text
              fz={{ base: 'sm', md: 'md' }}
              lh={{ base: 1.6, md: 1.6 }}
              ta="justify"
              style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              dangerouslySetInnerHTML={{ __html: perbekel.programUnggulan }}
            />
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default Page;