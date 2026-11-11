/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import NewsReader from '@/app/(public)/_com/NewsReader';
import { BeritaTanggal } from '../../_com/BeritaTanggal';
import colors from '@/con/colors';
import {
  Box,
  Center,
  Container,
  Group,
  Image,
  Skeleton,
  Stack,
  Text,
  Title,
  Grid,
  Card,
  AspectRatio,
  Badge,
  Divider,
} from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { IconVideo } from '@tabler/icons-react';

interface ExistingImage {
  id: string;
  link: string;
  name: string;
}

interface BeritaDetail {
  id: string;
  judul: string;
  deskripsi: string;
  content: string;
  image?: { link: string } | null;
  images?: ExistingImage[];
  linkVideo?: string | null;
  kategoriBerita?: { name: string } | null;
  tanggalTerbit?: string | null;
  createdAt: string;
}

function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(stateDashboardBerita.berita);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        await state.findUnique.load(id);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <Center>
        <Skeleton height={500} />
      </Center>
    );
  }

  if (!state.findUnique.data) {
    return (
      <Center>
        <Text>Data tidak ditemukan</Text>
      </Center>
    );
  }

  const data = state.findUnique.data as unknown as BeritaDetail;

  return (
    <Stack pos="relative" bg={colors.Bg} pb="xl" gap="xs" px={{ base: 'md', md: 0 }}>
      <Group px={{ base: 'md', md: 100 }}>
        <NewsReader />
      </Group>

      <Container w={{ base: '100%', md: '60%' }}>
        <Box pb={20}>
          {/* Kategori Badge */}
          {data.kategoriBerita?.name && (
            <Badge
              color={colors['blue-button']}
              variant="light"
              size="lg"
              mb="md"
              style={{ textTransform: 'uppercase' }}
            >
              {data.kategoriBerita.name}
            </Badge>
          )}

          {/* Judul */}
          <Title
            id="news-title"
            order={1}
            ta="center"
            c={colors['blue-button']}
            fw="bold"
            lh={{ base: 1.2, md: 1.25 }}
            mb="md"
          >
            {data.judul}
          </Title>
          <BeritaTanggal item={data} />

          <Divider my="xs" />
        </Box>

        {/* Featured Image */}
        {data.image?.link && (
          <Image
            src={data.image.link}
            alt={data.judul}
            w="100%"
            h={{ base: 300, md: 400 }}
            radius="md"
            loading="lazy"
            fit="cover"
          />
        )}

        {/* Content */}
        <Box mt="xl">
          <Title order={3} c={colors['blue-button']} mb="md">
            Deskripsi Berita
          </Title>
          <Text
            id="news-content"
            pb={20}
            px={0}
            fz={{ base: 'sm', md: 'md' }}
            lh={{ base: 1.6, md: 1.7 }}
            ta="justify"
            c="dimmed"
            style={{
              wordBreak: 'break-word',
              whiteSpace: 'normal',
            }}
            dangerouslySetInnerHTML={{
              __html: data.content || '',
            }}
          />
        </Box>

        {/* Gallery Images */}
        {data.images && data.images.length > 0 && (
          <Box mt="xl">
            <Group gap="xs" mb="md">
              <Title order={3} c={colors['blue-button']}>
                Galeri Foto
              </Title>
              <Badge color={colors['blue-button']} variant="light">
                {data.images.length}
              </Badge>
            </Group>
            <Grid gap="md">
              {data.images.map((img, index) => (
                <Grid.Col span={{ base: 6, md: 4 }} key={img.id}>
                  <Card p="xs" radius="md" withBorder>
                    <Image
                      src={img.link}
                      alt={img.name || `Foto ${index + 1}`}
                      h={180}
                      radius="sm"
                      fit="cover"
                      loading="lazy"
                    />
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Box>
        )}

        {/* YouTube Video */}
        {data.linkVideo && (
          <Box mt="xl">
            <Group gap="xs" mb="md">
              <Title order={3} c={colors['blue-button']}>
                Video
              </Title>
              <IconVideo size={24} color={colors['blue-button']} />
            </Group>
            <AspectRatio ratio={16 / 9} mah={500}>
              <iframe
                src={data.linkVideo}
                title="YouTube Video"
                allowFullScreen
                style={{
                  borderRadius: 12,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            </AspectRatio>
          </Box>
        )}


      </Container>
    </Stack>
  );
}

export default Page;
