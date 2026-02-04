/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import pencegahanKriminalitasState from '@/app/admin/(dashboard)/_state/keamanan/pencegahan-kriminalitas';
import colors from '@/con/colors';
import { Box, Button, Center, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowRight } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';


function Page() {
  const kriminalitasState = useProxy(pencegahanKriminalitasState);
  const findFirst = useProxy(pencegahanKriminalitasState.findFirst);
  const router = useTransitionRouter();

  const {
    data,
    loading,
    page,
    load,
  } = kriminalitasState.findMany;

  useEffect(() => {
    if (!findFirst.data && !findFirst.loading) {
      kriminalitasState.findFirst.load();
    }
  }, []);

  useShallowEffect(() => {
    const LIMIT = 3;
    load(page, LIMIT);
  }, [page]);

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  if (data.length === 0) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
        <Box px={{ base: 'md', md: 100 }}>
          <Title order={1} c={colors['blue-button']} fw="bold" lh={1.2}>
            Pencegahan Kriminalitas
          </Title>
          <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
            Keamanan Komunitas & Pencegahan Kriminal
          </Text>
        </Box>
        <SimpleGrid
          px={{ base: 20, md: 100 }}
          cols={{ base: 1, md: 2 }}
          spacing={{ base: 'md', md: 'xl' }}
        >
          <Paper p="xl" radius="xl" shadow="lg" bg="white">
            <Title order={2} c={colors['blue-button']} fw="bold" lh={1.2}>
              Program Keamanan Berjalan
            </Title>
            <Stack pt={30} gap="lg">
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                Tidak ada data pencegahan kriminalitas yang cocok
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>
    )
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
      <Box px={{ base: 'md', md: 100 }}>
        <Title order={1} c={colors['blue-button']} fw="bold" lh={1.2}>
          Pencegahan Kriminalitas
        </Title>
        <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
          Keamanan Komunitas & Pencegahan Kriminal
        </Text>
      </Box>
      <SimpleGrid
        px={{ base: 20, md: 100 }}
        cols={{ base: 1, md: 2 }}
        spacing={{ base: 'md', md: 'xl' }}
      >
        <Paper p="xl" radius="xl" shadow="lg" bg="white">
          <Title order={2} c={colors['blue-button']} fw="bold" lh={1.2}>
            Program Keamanan Berjalan
          </Title>
          <Stack pt={30} gap="lg">
            <Box
              style={{
                minHeight: 300,
              }}
            >
              {data.length > 0 ? (
                data.map((item) => (
                  <Paper
                    key={item.id}
                    p="md"
                    radius="md"
                    shadow="sm"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: colors['blue-button'],
                      transition: 'all 0.2s ease',
                      marginBottom: '10px' // Add space between items
                    }}
                    onClick={() =>
                      router.push(`/darmasaba/keamanan/pencegahan-kriminalitas/${item.id}`)
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = '#1a3e7a')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = colors['blue-button'])
                    }
                  >
                    <Stack gap="xs">
                      <Title order={3} c={colors['white-1']} lh={1.2}>
                        {item.judul}
                      </Title>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                  Tidak ada data pencegahan kriminalitas yang cocok
                </Text>
              )}
            </Box>
            <Button
              mt={20}
              fullWidth
              radius="xl"
              size="md"
              variant="outline"
              color="blue"
              rightSection={<IconArrowRight size={20} />}
              styles={{
                root: {
                  fontWeight: 600,
                  borderWidth: 2,
                },
              }}
              onClick={() =>
                router.push(
                  `/darmasaba/keamanan/pencegahan-kriminalitas/program-lainnya`
                )
              }
            >
              Jelajahi Program Lainnya
            </Button>
          </Stack>
        </Paper>
        <Box>
          {findFirst.loading ? (
            <Center><Skeleton h={400} /></Center>
          ) : findFirst.data ? (
            <Paper p="xl" radius="xl" shadow="lg" bg="white">
              {findFirst.data?.linkVideo ? (
                <Box
                  component="iframe"
                  src={convertToEmbedUrl(findFirst.data.linkVideo)}
                  width="100%"
                  height={300}
                  allowFullScreen
                  style={{ borderRadius: 8, marginBottom: 15 }}
                />
              ) : (
                <Text fz={{ base: 'xs', md: 'sm' }} c="dimmed" lh={1.4}>
                  Tidak ada video
                </Text>
              )}
              <Title order={2} py={10} fw="bold" c={colors['blue-button']} lh={1.2}>
                {findFirst.data?.judul}
              </Title>
              <Text
                fz={{ base: 'sm', md: 'md' }}
                lh={1.5}
                dangerouslySetInnerHTML={{ __html: findFirst.data?.deskripsiSingkat }}
              />
            </Paper>
          ) : null}
        </Box>
      </SimpleGrid>
    </Stack>
  );

  function convertToEmbedUrl(youtubeUrl: string): string {
    try {
      const url = new URL(youtubeUrl);
      const videoId = url.searchParams.get("v");
      if (!videoId) return youtubeUrl;
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (err) {
      console.error("Error converting YouTube URL to embed:", err);
      return youtubeUrl;
    }
  }
}

export default Page;