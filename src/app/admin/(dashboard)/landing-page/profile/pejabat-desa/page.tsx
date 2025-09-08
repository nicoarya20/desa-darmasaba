'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Grid, GridCol, Image, Paper, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';

function Page() {
  const router = useRouter();
  const allList = useProxy(profileLandingPageState.pejabatDesa);

  useShallowEffect(() => {
    allList.findUnique.load("edit");
  }, []);

  if (!allList.findUnique.data) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton radius="md" height={800} />
      </Stack>
    );
  }

  const dataArray = Array.isArray(allList.findUnique.data)
    ? allList.findUnique.data
    : [allList.findUnique.data];

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Grid align="center">
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} c={colors['blue-button']}>Preview Pejabat Desa</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Tooltip label="Edit Profil Pejabat" withArrow>
              <Button
                c="green"
                variant="light"
                leftSection={<IconEdit size={18} stroke={2} />}
                radius="md"
                onClick={() => router.push(`/admin/landing-page/profile/pejabat-desa/${allList.findUnique.data?.id}`)}
              >
                Edit
              </Button>
            </Tooltip>
          </GridCol>
        </Grid>
        {dataArray.map((item) => (
          <Paper key={item.id} p="xl" bg={'white'} withBorder radius="md" shadow="xs">
            <Box px={{ base: "sm", md: 100 }}>
              <Grid>
                <GridCol span={12}>
                  <Center>
                    <Image src="/darmasaba-icon.png" w={{ base: 100, md: 150 }} alt="Logo Desa" />
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
            <Box px={{ base: 0, md: 50 }} pb="xl">
              <Paper withBorder bg={"#fff"} radius="md" shadow="xs" p="lg">
                <Stack gap={0}>
                  <Center>
                    <Image
                      pt={{ base: 0, md: 60 }}
                      src={item.image?.link || "/perbekel.png"}
                      w={{ base: 250, md: 350 }}
                      alt="Foto Profil Pejabat"
                      radius="md"
                      onError={(e) => { e.currentTarget.src = "/perbekel.png"; }}
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
                <Text fz={{ base: "1.125rem", md: "1.5rem" }} fw="bold" mb={4}>Jabatan</Text>
                <Text fz={{ base: "1rem", md: "1.4rem" }} ta="justify" c={colors['blue-button']}>
                  {item.position}
                </Text>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}

export default Page;
