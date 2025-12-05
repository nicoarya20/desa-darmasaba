'use client';

import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  SimpleGrid,
  Stack,
  Text
} from '@mantine/core';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';

export default function VideoContent() {
  const videoState = useSnapshot(stateGallery.video);
  const router = useTransitionRouter()
  const { data, page, totalPages, loading } = videoState.findMany;

  // Handle search and pagination changes
  const loadData = useCallback((pageNum: number, searchTerm: string) => {
    stateGallery.video.findMany.load(pageNum, 3, searchTerm.trim());
  }, []);

  // Initial load and URL change handler
  useEffect(() => {
    const handleRouteChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get('search') || '';
      const urlPage = parseInt(urlParams.get('page') || '1');
      loadData(urlPage, urlSearch);
    };

    const handleSearchUpdate = (e: Event) => {
      const { search } = (e as CustomEvent).detail;
      loadData(1, search);
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('searchUpdate', handleSearchUpdate as EventListener);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('searchUpdate', handleSearchUpdate as EventListener);
    };
  }, [loadData]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    loadData(newPage, search);
  };


  const dataVideo = data || [];

  if (loading && !data) {
    return (
      <Box py={10}>
        <Text>Memuat Video...</Text>
      </Box>
    );
  }

  return (
    <Box pt={20} px={{ base: 'md', md: 100 }}>
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {dataVideo.map((v, k) => (
          <Box key={k}>
            <Paper
              mb={50}
              p="md"
              radius={26}
              bg={colors['white-trans-1']}
              w={{ base: '100%', md: '100%' }}
            >
              <Box>
                <Center>
                  <Box
                    component="iframe"
                    src={convertToEmbedUrl(v.linkVideo)}
                    width="100%"
                    height={300}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: 8 }}
                  />
                </Center>
              </Box>
              <Box>
                <Stack gap="sm" py={10}>
                  <Text fz="sm" c="dimmed">
                    {new Date(v.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text fw="bold" fz="sm" lineClamp={1}>
                    {v.name}
                  </Text>
                  <Text
                    ta="justify"
                    fz="sm"
                    dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                    style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                    lineClamp={3}
                    truncate="end"
                  />
                  <Group justify={"right"}>
                    <Button
                    onClick={() => router.push(`/darmasaba/desa/galery/video/${v.id}`)}
                    bg={colors['blue-button']}
                  >
                    Detail
                  </Button>
                  </Group>
                </Stack>
              </Box>
            </Paper>
          </Box>
        ))}
      </SimpleGrid>
      <Center>
        <Pagination
          value={page}
          onChange={handlePageChange}
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  );
}

// ✅ Fix: convert YouTube URL ke embed
function convertToEmbedUrl(youtubeUrl: string): string {
  try {
    const url = new URL(youtubeUrl);
    const videoId = url.searchParams.get('v');
    if (!videoId) return youtubeUrl;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (err) {
    console.error('Error converting YouTube URL to embed:', err);
    return youtubeUrl;
  }
}
