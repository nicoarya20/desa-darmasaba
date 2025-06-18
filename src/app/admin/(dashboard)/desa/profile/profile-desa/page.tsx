'use client'

import colors from '@/con/colors';
import { Box, Button, Card, Center, Grid, GridCol, Group, Image, Paper, Stack, Text, Title } from '@mantine/core';
import { useSnapshot } from 'valtio';
import stateProfileDesa from '../../../_state/desa/profile';
import { useEffect } from 'react';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

function Page() {
  const router = useRouter();
  const snap = useSnapshot(stateProfileDesa);

  // Panggil load data sekali saat komponen mount
  useEffect(() => {
    stateProfileDesa.sejarahDesa.findUnique.load("1");
    stateProfileDesa.visiMisiDesa.findUnique.load("1");
    stateProfileDesa.lambangDesa.findUnique.load("1");
    stateProfileDesa.maskotDesa.findUnique.load("1");
  }, []);

  const sejarah = snap.sejarahDesa.findUnique.data;
  const visiMisi = snap.visiMisiDesa.findUnique.data;
  const lambang = snap.lambangDesa.findUnique.data;
  const maskot = snap.maskotDesa.findUnique.data;

  return (
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack gap={"lg"}>
        <Title order={2}>Preview Profile Desa</Title>
        {/* Sejarah Desa */}
        {sejarah && (
          <Box>
            <Stack gap={'lg'}>
              <Paper p={"md"} bg={colors['BG-trans']}>
                <Grid>
                  <GridCol span={{ base: 12, md: 11 }}>
                    <Title order={2}>Preview Sejarah Desa</Title>
                  </GridCol>
                  <GridCol span={{ base: 12, md: 1 }}>
                    <Button bg={colors['blue-button']} onClick={() => router.push(`/admin/desa/profile/profile-desa/${sejarah.id}/sejarah_desa`)}>
                      <IconEdit size={20} />
                    </Button>
                  </GridCol>
                </Grid>
                <Box pb={30}>
                  <Center>
                    <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                  </Center>
                  <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>{sejarah.judul}</Text>
                </Box>
                <Paper p={"xl"} bg={colors['white-trans-1']}>
                  <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: sejarah.deskripsi }} />
                </Paper>
              </Paper>
            </Stack>
          </Box>
        )}

        {/* Visi Misi Desa */}
        {visiMisi && (
          <Box>
            <Stack gap={'lg'}>
              <Paper p={"md"} bg={colors['BG-trans']}>
                <Grid>
                  <GridCol span={{ base: 12, md: 11 }}>
                    <Title order={2}>Preview Visi Misi Desa</Title>
                  </GridCol>
                  <GridCol span={{ base: 12, md: 1 }}>
                    <Button onClick={() => router.push(`/admin/desa/profile/profile-desa/${visiMisi.id}/visi_misi_desa`)} bg={colors['blue-button']}>
                      <IconEdit size={20} />
                    </Button>
                  </GridCol>
                </Grid>
                <Box pb={30}>
                  <Center>
                    <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                  </Center>
                  <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Visi Misi Desa</Text>
                </Box>
                <Paper p={"xl"} bg={colors['white-trans-1']}>
                  <Text fw={"bold"} fz={{ base: "lg", md: "h2" }}>Visi Desa</Text>
                  <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: visiMisi.visi }} />
                  <Text fw={"bold"} fz={{ base: "lg", md: "h2" }}>Misi Desa</Text>
                  <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: visiMisi.misi }} />
                </Paper>
              </Paper>
            </Stack>
          </Box>
        )}

        {/* Lambang Desa */}
        {lambang && (
          <Box>
            <Stack gap={'lg'}>
              <Paper p={"md"} bg={colors['BG-trans']}>
                <Grid>
                  <GridCol span={{ base: 12, md: 11 }}>
                    <Title order={2}>Preview Lambang Desa</Title>
                  </GridCol>
                  <GridCol span={{ base: 12, md: 1 }}>
                    <Button onClick={() => router.push(`/admin/desa/profile/profile-desa/${lambang.id}/lambang_desa`)} bg={colors['blue-button']}>
                      <IconEdit size={20} />
                    </Button>
                  </GridCol>
                </Grid>
                <Box pb={30}>
                  <Center>
                    <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                  </Center>
                  <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Lambang Desa</Text>
                </Box>
                <Paper p={"xl"} bg={colors['white-trans-1']}>
                  <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: lambang.deskripsi }} />
                </Paper>
              </Paper>
            </Stack>
          </Box>
        )}

        {/* Maskot Desa */}
        {maskot && (
          <Box>
            <Stack gap={'lg'}>
              <Paper p={"md"} bg={colors['BG-trans']}>
                <Grid>
                  <GridCol span={{ base: 12, md: 11 }}>
                    <Title order={2}>Preview Maskot Desa</Title>
                  </GridCol>
                  <GridCol span={{ base: 12, md: 1 }}>
                    <Button onClick={() => router.push(`/admin/desa/profile/profile-desa/${maskot.id}/maskot_desa`)} bg={colors['blue-button']}>
                      <IconEdit size={20} />
                    </Button>
                  </GridCol>
                </Grid>
                <Box pb={30}>
                  <Center>
                    <Image src={"/pudak-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                  </Center>
                  <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Maskot Desa</Text>
                </Box>
                <Paper p={"xl"} bg={colors['white-trans-1']}>
                  <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: maskot.deskripsi }} />
                  <Group wrap="wrap" gap="md">
                    {maskot.images.map((img, index) => (
                      <Card key={index} p="xs" w={220}>
                        <Image
                         src={img.image.link}
                         alt={img.label}
                         w={200}
                         h={200}
                         fit="cover"
                         radius="md"
                         style={{ border: '1px solid #ccc', objectFit: 'cover' }}
                        />
                        <Text ta="center" mt="xs" fw="bold">{img.label}</Text>
                      </Card>
                    ))}
                  </Group>
                </Paper>
              </Paper>
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

export default Page;
