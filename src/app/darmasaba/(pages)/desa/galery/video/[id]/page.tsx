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
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconInfoCircle, IconVideo } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import BackButton from '../../../layanan/_com/BackButto';


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
          <Text fz={{ base: 'sm', md: 'md' }} c="red.9">
            Video yang Anda cari tidak tersedia.
          </Text>
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
      <Box>
        <BackButton />
      </Box>

      {/* Header - Dijadikan Title */}
      <Title
        order={1}
        ta="center"
        c={colors['blue-button']}
        mb="lg"
        lh={{ base: 1.2, md: 1.25 }}
      >
        {data.name || 'Video Galeri Desa'}
      </Title>

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
              style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}
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
              <Text fz={{ base: 'xs', md: 'sm' }} c="orange.9">
                Mohon maaf, video tidak dapat diputar.
              </Text>
            </Alert>
          ) : (
            <Alert
              color="gray"
              icon={<IconInfoCircle size={20} />}
              title="Tidak ada video"
              radius="md"
            >
              <Text fz={{ base: 'xs', md: 'sm' }} c="dimmed">
                Konten video belum tersedia.
              </Text>
            </Alert>
          )}

          {/* Informasi Tambahan */}
          {data.createdAt && (
            <Group gap="xs" justify="center" wrap="nowrap">
              <ThemeIcon variant="light" size="sm" radius="xl">
                <IconInfoCircle size={14} />
              </ThemeIcon>
              <Text
                fz={{ base: 'xs', md: 'sm' }}
                c="dimmed"
                lh={{ base: 1.4, md: 1.5 }}
              >
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
                fz={{ base: 'sm', md: 'md' }}
                c="dark"
                ta={"justify"}
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