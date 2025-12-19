'use client'

import colors from '@/con/colors';
import { Box, Button, Card, Center, Divider, Group, Image, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import stateProfileDesa from '../../../_state/desa/profile';

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
        <Title order={2} c={colors['blue-button']}>Preview Profil Desa</Title>

        {/* Sejarah Desa */}

        <Box visibleFrom='md'>
          {sejarah && (
            <Paper p={{ base: "lg", md: "xl" }} bg={'white'} withBorder radius="md" shadow="xs">
              <Group justify='space-between'>
                <Title order={3} c={colors['blue-button']}>Preview Sejarah Desa</Title>
                <Button
                  c="green"
                  variant="light"
                  leftSection={<IconEdit size={18} stroke={2} />}
                  radius="md"
                  onClick={() => router.push(`/admin/desa/profil/profil-desa/${sejarah.id}/sejarah_desa`)}
                >
                  Edit
                </Button>
              </Group>

              <Box py="xl">
                <Paper bg={colors['white-1']} withBorder radius="md" shadow="xs" p="lg">
                  <Stack gap={0}>
                    <Center>
                      <Image loading='lazy' src="/darmasaba-icon.png" w={{ base: 150, md: 250 }} alt="Logo Desa" />
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
                  <Box px={20}>
                    <Text fz={{ base: "md", md: "h3" }} style={{ wordBreak: "break-word", whiteSpace: "normal" }} ta="justify" dangerouslySetInnerHTML={{ __html: sejarah.deskripsi }} />
                  </Box>
                </Paper>
              </Box>
            </Paper>
          )}
        </Box>

        <Box hiddenFrom='md'>
          {sejarah && (
            <Paper p={{ base: "md", md: "xl" }} bg="white" withBorder radius="md" shadow="xs">
              {/* Header */}
              <Group justify="space-between" align="center" mb="md">
                <Title order={3} c={colors['blue-button']}>
                  Preview Sejarah Desa
                </Title>

                <Button
                  variant="light"
                  color="green"
                  radius="md"
                  leftSection={<IconEdit size={18} />}
                  onClick={() =>
                    router.push(`/admin/desa/profil/profil-desa/${sejarah.id}/sejarah_desa`)
                  }
                >
                  Edit
                </Button>
              </Group>

              {/* Content Wrapper */}
              <Box
                mx="auto"
                w="100%"
                maw={720} // batas nyaman baca
              >
                <Paper
                  bg={colors['white-1']}
                  withBorder
                  radius="md"
                  p={{ base: "md", md: "lg" }}
                >
                  {/* Logo + Title */}
                  <Stack align="center" gap="xs">
                    <Image
                      src="/darmasaba-icon.png"
                      alt="Logo Desa"
                      w={{ base: 120, md: 200 }}
                      loading="lazy"
                    />

                    <Paper
                      bg={colors['blue-button']}
                      px="md"
                      py="sm"
                      radius="md"
                      mt={{ base: "sm", md: -24 }} // aman di mobile
                    >
                      <Text
                        ta="center"
                        c="white"
                        fw={700}
                        fz={{ base: "lg", md: "xl" }}
                      >
                        {sejarah.judul}
                      </Text>
                    </Paper>
                  </Stack>

                  <Divider my="md" color={colors['blue-button']} />

                  {/* Deskripsi */}
                  <Box pl={10}>
                    <Text
                      fz="sm"
                      lh="1.6"
                      ta="left"
                      style={{ wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: sejarah.deskripsi }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Visi Misi Desa */}
        <Box visibleFrom='md'>
          {visiMisi && (
            <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
              <Group justify='space-between'>
                <Title order={3} c={colors['blue-button']}>Preview Visi Misi Desa</Title>
                <Button
                  c="green"
                  variant="light"
                  leftSection={<IconEdit size={18} stroke={2} />}
                  radius="md"
                  onClick={() => router.push(`/admin/desa/profil/profil-desa/${visiMisi.id}/visi_misi_desa`)}
                >
                  Edit
                </Button>
              </Group>


              <Box px={{ base: 0, md: 50 }} py="xl">
                <Paper bg={colors['white-1']} withBorder radius="md" shadow="xs" p="lg">
                  <Stack gap={0}>
                    <Center>
                      <Image loading='lazy' src="/darmasaba-icon.png" w={{ base: 150, md: 250 }} alt="Logo Desa" />
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
                  <Box px={20}>
                    <Text fw="bold" fz={{ base: "lg", md: "h2" }}>Visi Desa</Text>
                    <Text fz={{ base: "md", md: "h3" }} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: visiMisi.visi }} />
                  </Box>
                  <Box px={20}>
                    <Text fw="bold" fz={{ base: "lg", md: "h2" }}>Misi Desa</Text>
                    <Text fz={{ base: "md", md: "h3" }} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: visiMisi.misi }} />
                  </Box>
                </Paper>
              </Box>
            </Paper>
          )}
        </Box>

        <Box hiddenFrom='md'>
          {visiMisi && (
            <Paper p={{ base: "md", md: "xl" }} bg="white" withBorder radius="md" shadow="xs">
              {/* Header */}
              <Group justify="space-between" align="center" mb="md">
                <Title order={3} c={colors['blue-button']}>
                  Preview Visi Misi Desa
                </Title>

                <Button
                  variant="light"
                  color="green"
                  radius="md"
                  leftSection={<IconEdit size={18} />}
                  onClick={() => router.push(`/admin/desa/profil/profil-desa/${visiMisi.id}/visi_misi_desa`)}
                >
                  Edit
                </Button>
              </Group>

              {/* Content Wrapper */}
              <Box
                mx="auto"
                w="100%"
                maw={720} // batas nyaman baca
              >
                <Paper
                  bg={colors['white-1']}
                  withBorder
                  radius="md"
                  p={{ base: "md", md: "lg" }}
                >
                  {/* Logo + Title */}
                  <Stack align="center" gap="xs">
                    <Image
                      src="/darmasaba-icon.png"
                      alt="Logo Desa"
                      w={{ base: 120, md: 200 }}
                      loading="lazy"
                    />

                    <Paper
                      bg={colors['blue-button']}
                      px="md"
                      py="sm"
                      radius="md"
                      mt={{ base: "sm", md: -24 }} // aman di mobile
                    >
                      <Text
                        ta="center"
                        c="white"
                        fw={700}
                        fz={{ base: "lg", md: "xl" }}
                      >
                        Visi Misi Desa
                      </Text>
                    </Paper>
                  </Stack>

                  <Divider my="md" color={colors['blue-button']} />

                  <Stack pl={10}>
                    <Text fw="bold" fz={{ base: "lg", md: "h2" }}>Visi Desa</Text>
                    <Text
                      fz="sm"
                      lh="1.6"
                      ta="left"
                      style={{ wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: visiMisi.visi }}
                    />
                  </Stack>

                  <Stack pl={10}>
                    <Text fw="bold" fz={{ base: "lg", md: "h2" }}>Misi Desa</Text>
                    <Text
                      fz="sm"
                      lh="1.6"
                      ta="left"
                      style={{ wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: visiMisi.misi }}
                    />
                  </Stack>
                </Paper>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Lambang Desa */}
        <Box visibleFrom='md'>
          {lambang && (
            <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
              <Group justify='space-between'>
                <Title order={3} c={colors['blue-button']}>Preview Lambang Desa</Title>
                <Button
                  c="green"
                  variant="light"
                  leftSection={<IconEdit size={18} stroke={2} />}
                  radius="md"
                  onClick={() => router.push(`/admin/desa/profil/profil-desa/${lambang.id}/lambang_desa`)}
                >
                  Edit
                </Button>
              </Group>

              <Box px={{ base: 0, md: 50 }} py="xl">
                <Paper bg={colors['white-1']} withBorder radius="md" shadow="xs" p="lg">
                  <Stack gap={0}>
                    <Center>
                      <Image loading='lazy' src="/darmasaba-icon.png" w={{ base: 150, md: 250 }} alt="Logo Desa" />
                    </Center>
                    <Paper
                      bg={colors['blue-button']}
                      py="md"
                      px="sm"
                      radius="md"
                      style={{ mt: -30, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                    >
                      <Text ta="center" c={colors['white-1']} fw="bolder" fz={{ base: "1.2rem", md: "1.6rem" }}>
                        {lambang.judul}
                      </Text>
                    </Paper>
                  </Stack>
                  <Divider my="md" color={colors['blue-button']} />
                  <Box px={20}>
                    <Text fz={{ base: "md", md: "h3" }} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: lambang.deskripsi }} />
                  </Box>
                </Paper>
              </Box>
            </Paper>
          )}
        </Box>

        <Box hiddenFrom='md'>
          {lambang && (
            <Paper p={{ base: "md", md: "xl" }} bg="white" withBorder radius="md" shadow="xs">
              {/* Header */}
              <Group justify="space-between" align="center" mb="md">
                <Title order={3} c={colors['blue-button']}>
                  Preview Lambang Desa
                </Title>

                <Button
                  variant="light"
                  color="green"
                  radius="md"
                  leftSection={<IconEdit size={18} />}
                  onClick={() =>
                    router.push(`/admin/desa/profil/profil-desa/${lambang.id}/lambang_desa`)
                  }
                >
                  Edit
                </Button>
              </Group>

              {/* Content Wrapper */}
              <Box
                mx="auto"
                w="100%"
                maw={720} // batas nyaman baca
              >
                <Paper
                  bg={colors['white-1']}
                  withBorder
                  radius="md"
                  p={{ base: "md", md: "lg" }}
                >
                  {/* Logo + Title */}
                  <Stack align="center" gap="xs">
                    <Image
                      src="/darmasaba-icon.png"
                      alt="Logo Desa"
                      w={{ base: 120, md: 200 }}
                      loading="lazy"
                    />

                    <Paper
                      bg={colors['blue-button']}
                      px="md"
                      py="sm"
                      radius="md"
                      mt={{ base: "sm", md: -24 }} // aman di mobile
                    >
                      <Text
                        ta="center"
                        c="white"
                        fw={700}
                        fz={{ base: "lg", md: "xl" }}
                      >
                        {lambang.judul}
                      </Text>
                    </Paper>
                  </Stack>

                  <Divider my="md" color={colors['blue-button']} />

                  {/* Deskripsi */}
                  <Box pl={10}>
                    <Text
                      fz="sm"
                      lh="1.6"
                      ta="left"
                      style={{ wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: lambang.deskripsi }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Maskot Desa */}
        <Box visibleFrom='md'>
          {maskot && (
            <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
              <Group justify='space-between'>
                <Title order={3} c={colors['blue-button']}>Preview Maskot Desa</Title>
                <Button
                  c="green"
                  variant="light"
                  leftSection={<IconEdit size={18} stroke={2} />}
                  radius="md"
                  onClick={() => router.push(`/admin/desa/profil/profil-desa/${maskot.id}/maskot_desa`)}
                >
                  Edit
                </Button>
              </Group>

              <Box px={{ base: 0, md: 50 }} py="xl">
                <Paper bg={colors['white-1']} withBorder radius="md" shadow="xs" p="lg">
                  <Stack gap={0}>
                    <Center>
                      <Image loading='lazy' src="/pudak-icon.png" w={{ base: 150, md: 250 }} alt="Maskot Desa" />
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
                  <Box px={20}>
                    <Text fz={{ base: "md", md: "h3" }} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: maskot.deskripsi }} />
                  </Box>
                  <Stack mt="md" gap="sm">
                    <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
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
                              loading='lazy'
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
        </Box>

        <Box hiddenFrom='md'>
          {maskot && (
            <Paper p={{ base: "md", md: "xl" }} bg="white" withBorder radius="md" shadow="xs">
              {/* Header */}
              <Group justify="space-between" align="center" mb="md">
                <Title order={3} c={colors['blue-button']}>
                  Preview Maskot Desa
                </Title>

                <Button
                  variant="light"
                  color="green"
                  radius="md"
                  leftSection={<IconEdit size={18} />}
                  onClick={() =>
                    router.push(`/admin/desa/profil/profil-desa/${maskot.id}/maskot_desa`)
                  }
                >
                  Edit
                </Button>
              </Group>

              {/* Content Wrapper */}
              <Box
                mx="auto"
                w="100%"
                maw={720} // batas nyaman baca
              >
                <Paper
                  bg={colors['white-1']}
                  withBorder
                  radius="md"
                  p={{ base: "md", md: "lg" }}
                >
                  {/* Logo + Title */}
                  <Stack align="center" gap="xs">
                    <Image
                      src="/pudak-icon.png"
                      alt="Logo Desa"
                      w={{ base: 120, md: 200 }}
                      loading="lazy"
                    />

                    <Paper
                      bg={colors['blue-button']}
                      px="md"
                      py="sm"
                      radius="md"
                      mt={{ base: "sm", md: -24 }} // aman di mobile
                    >
                      <Text
                        ta="center"
                        c="white"
                        fw={700}
                        fz={{ base: "lg", md: "xl" }}
                      >
                        Maskot Desa
                      </Text>
                    </Paper>
                  </Stack>

                  <Divider my="md" color={colors['blue-button']} />

                  {/* Deskripsi */}
                  <Box pl={10}>
                    <Text
                      fz="sm"
                      lh="1.6"
                      ta="left"
                      style={{ wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: maskot.deskripsi }}
                    />
                  </Box>
                  <Stack mt="md" gap="sm">
                    <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
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
                              loading='lazy'
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
        </Box>
      </Stack>
    </Paper>
  );
}

export default Page;
