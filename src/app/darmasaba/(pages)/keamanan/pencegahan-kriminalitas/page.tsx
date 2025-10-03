/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import pencegahanKriminalitasState from '@/app/admin/(dashboard)/_state/keamanan/pencegahan-kriminalitas';
import colors from '@/con/colors';
import { Box, Button, Center, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
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
  }, [findFirst.data, findFirst.loading]);

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

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
      <Box px={{ base: 'md', md: 100 }}>
        <Text fz={{ base: 'h1', md: '2.5rem' }} c={colors['blue-button']} fw="bold">
          Pencegahan Kriminalitas
        </Text>
        <Text c={colors['blue-button']} fz={{ base: 'h4', md: 'h3' }}>
          Keamanan Komunitas & Pencegahan Kriminal
        </Text>
      </Box>
      <SimpleGrid
        px={{ base: 20, md: 100 }}
        cols={{ base: 1, md: 2 }}
        spacing="xl"
      >
        <Paper p="xl" radius="xl" shadow="lg" >
          <Text fz={{ base: 'h3', md: 'h2' }} c={colors['blue-button']} fw="bold">
            Program Keamanan Berjalan
          </Text>
          <Stack pt={30} gap="lg">
            {data.length > 0 ? (
              data.map((item) => (
                <a key={item.id} href={`/darmasaba/keamanan/pencegahan-kriminalitas/${item.id}`}>
                  <Paper p="md" bg={colors['blue-button']} radius="md" shadow="sm">
                    <Stack gap={"xs"}>
                      <Text fz="h3" c={colors['white-1']}>
                        {item.judul}
                      </Text>
                    </Stack>
                  </Paper>
                </a>
              ))
            ) : (
              <Text color="dimmed">
                Tidak ada data pencegahan kriminalitas yang cocok
              </Text>
            )}
            <Button
              mt={20}
              fullWidth
              radius="xl"
              size="md"
              bg={colors['blue-button']}
              rightSection={<IconArrowRight size={20} color={colors['white-1']} />}
              onClick={() => router.push(`/darmasaba/keamanan/pencegahan-kriminalitas/program-lainnya`)}
            >
              Jelajahi Program Lainnya
            </Button>
          </Stack>
        </Paper>
        <Box>
          {findFirst.loading ? (
            <Center><Skeleton h={400} /></Center>
          ) : findFirst.data ? (
            <Paper p="xl" radius="xl" shadow="lg">
              {findFirst.data?.linkVideo ? (
                <Box
                  component="iframe"
                  src={convertToEmbedUrl(findFirst.data.linkVideo)}
                  width="100%"
                  height={300}
                  allowFullScreen
                  style={{ borderRadius: 8 }}
                />
              ) : (
                <Text fz="sm" c="dimmed">Tidak ada video</Text>
              )}
              <Text py={10} fz={{ base: 'h3', md: 'h2' }} fw="bold" c={colors['blue-button']}>
                {findFirst.data?.judul}
              </Text>
              <Text fz="h4" c={colors['blue-button']}>
                {findFirst.data?.deskripsiSingkat}
              </Text>
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
