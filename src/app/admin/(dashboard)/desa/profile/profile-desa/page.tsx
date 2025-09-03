'use client'

import colors from '@/con/colors';
import { Box, Button, Card, Center, Divider, Grid, GridCol, Image, Paper, SimpleGrid, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useSnapshot } from 'valtio';
import stateProfileDesa from '../../../_state/desa/profile';
import { useEffect } from 'react';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

function Page() {
  const router = useRouter();
  const snap = useSnapshot(stateProfileDesa);

  useEffect(() => {
    stateProfileDesa.sejarahDesa.findUnique.load("edit");
    stateProfileDesa.visiMisiDesa.findUnique.load("edit");
    stateProfileDesa.lambangDesa.findUnique.load("edit");
    stateProfileDesa.maskotDesa.findUnique.load("edit");
  }, []);

  const sejarah = snap.sejarahDesa.findUnique.data;
  const visiMisi = snap.visiMisiDesa.findUnique.data;
  const lambang = snap.lambangDesa.findUnique.data;
  const maskot = snap.maskotDesa.findUnique.data;

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="lg">
        <Title order={2} c={colors['blue-button']}>Preview Profile Desa</Title>

        {/* Sejarah Desa */}
        {sejarah && (
          <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
            <Grid align="center">
              <GridCol span={{ base: 12, md: 11 }}>
                <Title order={3} c={colors['blue-button']}>Preview Sejarah Desa</Title>
              </GridCol>
              <GridCol span={{ base: 12, md: 1 }}>
                <Tooltip label="Edit Sejarah Desa" withArrow>
                  <Button
                    c="green"
                    variant="light"
                    leftSection={<IconEdit size={18} stroke={2} />}
                    radius="md"
                    onClick={() => router.push(`/admin/desa/profile/profile-desa/${sejarah.id}/sejarah_desa`)}
                  >
                    Edit
                  </Button>
                </Tooltip>
              </GridCol>
            </Grid>

            <Box px={{ base: 0, md: 50 }} py="xl">
              <Paper bg={colors['white-1']} withBorder radius="md" shadow="xs" p="lg">
                <Stack gap={0}>
                  <Center>
                    <Image src="/darmasaba-icon.png" w={{ base: 150, md: 250 }} alt="Logo Desa" />
                  </Center>
                  <Paper
                    bg={colors['blue-button']}
                    py="md"
                    px="sm"
                    radius="md"
                    style={{ mt: -30, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  >
                    <Text ta="center" c={colors['white-1']} fw="bolder" fz={{ base: "1.2rem", md: "1.6rem" }}>
                      {sejarah.judul}
                    </Text>
                  </Paper>
                </Stack>
                <Divider my="md" color={colors['blue-button']} />
                <Text fz={{ base: "md", md: "h3" }} ta="justify" dangerouslySetInnerHTML={{ __html: sejarah.deskripsi }} />
              </Paper>
            </Box>
          </Paper>
        )}

        {/* Visi Misi Desa */}
        {visiMisi && (
          <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
            <Grid align="center">
              <GridCol span={{ base: 12, md: 11 }}>
                <Title order={3} c={colors['blue-button']}>Preview Visi Misi Desa</Title>
              </GridCol>
              <GridCol span={{ base: 12, md: 1 }}>
                <Tooltip label="Edit Visi Misi Desa" withArrow>
                  <Button
                    c="green"
                    variant="light"
                    leftSection={<IconEdit size={18} stroke={2} />}
                    radius="md"
                    onClick={() => router.push(`/admin/desa/profile/profile-desa/${visiMisi.id}/visi_misi_desa`)}
                  >
                    Edit
                  </Button>
                </Tooltip>
              </GridCol>
            </Grid>

            <Box px={{ base: 0, md: 50 }} py="xl">
              <Paper bg={colors['white-1']} withBorder radius="md" shadow="xs" p="lg">
                <Stack gap={0}>
                  <Center>
                    <Image src="/darmasaba-icon.png" w={{ base: 150, md: 250 }} alt="Logo Desa" />
                  </Center>
                  <Paper
                    bg={colors['blue-button']}
                    py="md"
                    px="sm"
                    radius="md"
                    style={{ mt: -30, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  >
                    <Text ta="center" c={colors['white-1']} fw="bolder" fz={{ base: "1.2rem", md: "1.6rem" }}>
                      Visi Misi Desa
                    </Text>
                  </Paper>
                </Stack>
                <Divider my="md" color={colors['blue-button']} />
                <Text fw="bold" fz={{ base: "lg", md: "h2" }}>Visi Desa</Text>
                <Text fz={{ base: "md", md: "h3" }} ta="justify" dangerouslySetInnerHTML={{ __html: visiMisi.visi }} />
                <Text fw="bold" fz={{ base: "lg", md: "h2" }}>Misi Desa</Text>
                <Text fz={{ base: "md", md: "h3" }} ta="justify" dangerouslySetInnerHTML={{ __html: visiMisi.misi }} />
              </Paper>
            </Box>
          </Paper>
        )}

        {/* Lambang Desa */}
        {lambang && (
          <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
            <Grid align="center">
              <GridCol span={{ base: 12, md: 11 }}>
                <Title order={3} c={colors['blue-button']}>Preview Lambang Desa</Title>
              </GridCol>
              <GridCol span={{ base: 12, md: 1 }}>
                <Tooltip label="Edit Lambang Desa" withArrow>
                  <Button
                    c="green"
                    variant="light"
                    leftSection={<IconEdit size={18} stroke={2} />}
                    radius="md"
                    onClick={() => router.push(`/admin/desa/profile/profile-desa/${lambang.id}/lambang_desa`)}
                  >
                    Edit
                  </Button>
                </Tooltip>
              </GridCol>
            </Grid>

            <Box px={{ base: 0, md: 50 }} py="xl">
              <Paper bg={colors['white-1']} withBorder radius="md" shadow="xs" p="lg">
                <Stack gap={0}>
                  <Center>
                    <Image src="/darmasaba-icon.png" w={{ base: 150, md: 250 }} alt="Logo Desa" />
                  </Center>
                  <Paper
                    bg={colors['blue-button']}
                    py="md"
                    px="sm"
                    radius="md"
                    style={{ mt: -30, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  >
                    <Text ta="center" c={colors['white-1']} fw="bolder" fz={{ base: "1.2rem", md: "1.6rem" }}>
                      Lambang Desa
                    </Text>
                  </Paper>
                </Stack>
                <Divider my="md" color={colors['blue-button']} />
                <Text fz={{ base: "md", md: "h3" }} ta="justify" dangerouslySetInnerHTML={{ __html: lambang.deskripsi }} />
              </Paper>
            </Box>
          </Paper>
        )}

        {/* Maskot Desa */}
        {maskot && (
          <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
            <Grid align="center">
              <GridCol span={{ base: 12, md: 11 }}>
                <Title order={3} c={colors['blue-button']}>Preview Maskot Desa</Title>
              </GridCol>
              <GridCol span={{ base: 12, md: 1 }}>
                <Tooltip label="Edit Maskot Desa" withArrow>
                  <Button
                    c="green"
                    variant="light"
                    leftSection={<IconEdit size={18} stroke={2} />}
                    radius="md"
                    onClick={() => router.push(`/admin/desa/profile/profile-desa/${maskot.id}/maskot_desa`)}
                  >
                    Edit
                  </Button>
                </Tooltip>
              </GridCol>
            </Grid>

            <Box px={{ base: 0, md: 50 }} py="xl">
              <Paper bg={colors['white-1']} withBorder radius="md" shadow="xs" p="lg">
                <Stack gap={0}>
                  <Center>
                    <Image src="/pudak-icon.png" w={{ base: 150, md: 250 }} alt="Maskot Desa" />
                  </Center>
                  <Paper
                    bg={colors['blue-button']}
                    py="md"
                    px="sm"
                    radius="md"
                    style={{ mt: -30, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  >
                    <Text ta="center" c={colors['white-1']} fw="bolder" fz={{ base: "1.2rem", md: "1.6rem" }}>
                      Maskot Desa
                    </Text>
                  </Paper>
                </Stack>
                <Divider my="md" color={colors['blue-button']} />
                <Text fz={{ base: "md", md: "h3" }} ta="justify" dangerouslySetInnerHTML={{ __html: maskot.deskripsi }} />
                <Stack mt="md" gap="sm">
                  <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                    {maskot.images.map((img, idx) => (
                      <Card withBorder key={idx} p="xs" w={{ base: '100%', md: 180 }}>
                        <Center>
                          <Image
                            src={img.image.link}
                            alt={img.label}
                            w={150}
                            h={150}
                            fit="cover"
                            radius="md"
                            style={{ border: '1px solid #ccc' }}
                          />
                        </Center>
                        <Text ta="center" mt="xs" fw="bold">{img.label}</Text>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Stack>
              </Paper>
            </Box>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}

export default Page;
