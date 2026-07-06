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
  Text,
  Title
} from '@mantine/core';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';

export default function VideoContent() {
  const videoState = useSnapshot(stateGallery.video);
  const router = useTransitionRouter();
  const { data, page, totalPages, loading } = videoState.findMany;

  const loadData = useCallback((pageNum: number, searchTerm: string) => {
    stateGallery.video.findMany.load(pageNum, 3, searchTerm.trim());
  }, []);

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
        <Text fz={{ base: 'sm', md: 'md' }} c="dimmed" ta="center">
          Memuat Video...
        </Text>
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
              w="100%"
            >
              <Center>
                <Box
                  component="iframe"
                  src={convertToEmbedUrl(v.linkVideo)}
                  width="100%"
                  height={300}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none', borderRadius: 8 }}
                />
              </Center>

              <Stack gap="sm" py={10}>
                {/* Tanggal: Caption */}
                <Text
                  fz={{ base: 12, md: 14 }}
                  c="dimmed"
                  ta="left"
                >
                  {new Date(v.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>

                {/* Judul Video: Subsection (H3) */}
                <Title
                  order={3}
                  c="dark"
                  ta="left"
                  lh={1.3}
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {v.name}
                </Title>

                {/* Deskripsi: Body kecil */}
                <Text
                  ta="justify"
                  fz={{ base: 13, md: 14 }}
                  c="dimmed"
                  style={{ wordBreak: 'break-word' }}
                  lineClamp={3}
                >
                  <span dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
                </Text>

                <Group justify="right">
                  <Button
                    onClick={() => router.push(`/darmasaba/desa/galery/video/${v.id}`)}
                    bg={colors['blue-button']}
                    fz={{ base: 'sm', md: 'md' }}
                  >
                    Detail
                  </Button>
                </Group>
              </Stack>
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