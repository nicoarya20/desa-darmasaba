/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import { Box, Center, Pagination, Paper, SimpleGrid, Spoiler, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

export default function VideoContent() {
  const [expanded, setExpanded] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const videoState = useSnapshot(stateGallery.video);
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = videoState.findMany;

  // ✅ Baca dari URL hanya di client
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSearch = urlParams.get('search') || '';
    setCurrentSearch(urlSearch);
    load(1, 10, urlSearch.trim());
  }, []);

  const handlePageChange = (newPage: number) => {
    load(newPage, 10, currentSearch.trim());
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
            <Paper mb={50} p="md" radius={26} bg={colors['white-trans-1']} w={{ base: '100%', md: '100%' }}>
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
                  <Spoiler
                    showLabel={
                      <Text fw="bold" fz="sm" c={colors['blue-button']}>
                        Show more
                      </Text>
                    }
                    hideLabel={
                      <Text fw="bold" fz="sm" c={colors['blue-button']}>
                        Hide details
                      </Text>
                    }
                    expanded={expanded}
                    onExpandedChange={setExpanded}
                  >
                    <Text
                      ta="justify"
                      fz="sm"
                      dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                    />
                  </Spoiler>
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

// ✅ Fix: HAPUS SPASI BERLEBIH DI URL
function convertToEmbedUrl(youtubeUrl: string): string {
  try {
    const url = new URL(youtubeUrl);
    const videoId = url.searchParams.get('v');
    if (!videoId) return youtubeUrl;
    return `https://www.youtube.com/embed/${videoId}`; // ✅ tanpa spasi!
  } catch (err) {
    console.error('Error converting YouTube URL to embed:', err);
    return youtubeUrl;
  }
}