'use client';

import colors from '@/con/colors';
import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconInfoCircle, IconVideo } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery'; // pastikan state bisa dipakai di publik
import BackButton from '../../../layanan/_com/BackButto';

// Fungsi helper: aman dan tanpa spasi
function convertToEmbedUrl(youtubeUrl: string): string {
  try {
    const url = new URL(youtubeUrl);
    let videoId = '';

    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1);
    } else if (url.hostname.includes('youtube.com')) {
      videoId = url.searchParams.get('v') || '';
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : youtubeUrl;
  } catch {
    return youtubeUrl;
  }
}

export default function DetailVideoUser() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const videoState = useProxy(stateGallery.video);
  const [videoError, setVideoError] = useState(false);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useShallowEffect(() => {
    if (id) {
      videoState.findUnique.load(id);
    }
  }, [id]);

  const data = videoState.findUnique.data;

  if (!videoState.findUnique && !id) {
    return (
      <Box py="xl" px={{ base: 'md', md: 'lg' }}>
        <Skeleton height={400} radius="md" />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box py="xl" px={{ base: 'md', md: 'lg' }}>
        <Alert
          icon={<IconInfoCircle size={20} />}
          title="Video tidak ditemukan"
          color="red"
          radius="md"
        >
          Video yang Anda cari tidak tersedia.
        </Alert>
        <Button
          leftSection={<IconArrowBack size={16} />}
          mt="md"
          onClick={() => router.push('/darmasaba/galeri/video')}
          variant="outline"
        >
          Kembali ke Galeri
        </Button>
      </Box>
    );
  }

  const embedUrl = data.linkVideo ? convertToEmbedUrl(data.linkVideo) : null;

  return (
    <Box py="xl" px={{ base: 'md', md: 100 }}>
      {/* Tombol Kembali */}
      <Box >
        <BackButton />
      </Box>

      {/* Header */}
      <Text
        ta="center"
        fz={{ base: 'xl', md: '2xl' }}
        fw={700}
        c={colors['blue-button']}
        mb="lg"
      >
        {data.name || 'Video Galeri Desa'}
      </Text>

      {/* Konten Utama */}
      <Card
        shadow="sm"
        radius="md"
        p={{ base: 'md', md: 'xl' }}
        bg={colors['white-1']}
      >
        <Stack gap="lg">
          {/* Video */}
          {embedUrl ? (
            <Box
              pos="relative"
              style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }} // 16:9 aspect ratio
            >
              <iframe
                src={embedUrl}
                title={data.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                  border: 'none',
                }}
                onError={() => setVideoError(true)}
              />
            </Box>
          ) : videoError ? (
            <Alert
              color="orange"
              icon={<IconVideo size={20} />}
              title="Gagal memuat video"
              radius="md"
            >
              Mohon maaf, video tidak dapat diputar.
            </Alert>
          ) : (
            <Alert
              color="gray"
              icon={<IconInfoCircle size={20} />}
              title="Tidak ada video"
              radius="md"
            >
              Konten video belum tersedia.
            </Alert>
          )}

          {/* Informasi Tambahan */}
          {data.createdAt && (
            <Group gap="xs" justify="center" wrap="nowrap">
              <ThemeIcon variant="light" size="sm" radius="xl">
                <IconInfoCircle size={14} />
              </ThemeIcon>
              <Text fz="sm" c="dimmed">
                Diunggah pada{' '}
                {new Date(data.createdAt).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </Group>
          )}

          {/* Deskripsi */}
          {data.deskripsi && (
            <Paper p="md" bg="gray.0" radius="md">
              <Text
                fz="md"
                c="dark"
                dangerouslySetInnerHTML={{ __html: data.deskripsi }}
                style={{
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: 1.6,
                }}
              />
            </Paper>
          )}
        </Stack>
      </Card>
    </Box>
  );
}