/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateKesejahteraanMasyarakat from '@/app/admin/(dashboard)/_state/ekonomi/kesejahteraan-masyarakat';
import NewsReader from '@/app/darmasaba/_com/NewsReader';
import colors from '@/con/colors';
import {
  Box,
  Button,
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
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { IconVideo, IconCalendar, IconArrowBack, IconDatabaseOff } from '@tabler/icons-react';

interface ExistingImage {
  id: string;
  link: string;
  name: string;
}

interface KesejahteraanDetail {
  id: string;
  judul: string;
  deskripsi: string;
  content: string;
  createdAt: string;
  image?: { link: string } | null;
  images?: ExistingImage[];
  linkVideo?: string | null;
}

function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const state = useProxy(stateKesejahteraanMasyarakat.kesejahteraan);
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
      <Stack bg={colors.Bg} pb="xl" gap="xs" px={{ base: 'md', md: 0 }}>
        <Box px={{ base: 'md', md: 100 }} pt="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowBack size={16} />}
            onClick={() => router.back()}
          >
            Kembali
          </Button>
        </Box>
        <Center py={80}>
          <Stack align="center" gap="md">
            <IconDatabaseOff size={80} color={colors.grey['2']} />
            <Text ta="center" fz="lg" fw={500} c="dimmed">
              Data Tidak Ditemukan
            </Text>
            <Text ta="center" fz="sm" c="dimmed" maw={400}>
              Program kesejahteraan masyarakat yang Anda cari tidak tersedia atau sudah dihapus.
            </Text>
          </Stack>
        </Center>
      </Stack>
    );
  }

  const data = state.findUnique.data as unknown as KesejahteraanDetail;

  return (
    <Stack pos="relative" bg={colors.Bg} pb="xl" gap="xs" px={{ base: 'md', md: 0 }}>
      <Box px={{ base: 'md', md: 100 }}>
        <Button
          variant="subtle"
          leftSection={<IconArrowBack size={16} />}
          onClick={() => router.back()}
        >
          Kembali
        </Button>
      </Box>

      <Group px={{ base: 'md', md: 100 }}>
        <NewsReader />
      </Group>

      <Container w={{ base: '100%', md: '60%' }}>
        <Box pb={20}>
          {/* Badge */}
          <Badge
            color={colors['blue-button']}
            variant="light"
            size="lg"
            mb="md"
            style={{ textTransform: 'uppercase' }}
          >
            Kesejahteraan Masyarakat
          </Badge>

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

          {/* Tanggal */}
          <Group justify="center" gap="xs" mb="xs">
            <IconCalendar size={18} color={colors['blue-button']} />
            <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }}>
              {new Date(data.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </Group>

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
            Deskripsi Program
          </Title>
          <Text
            id="news-content"
            py={20}
            px={{ base: 0, md: 'sm' }}
            fz={{ base: 'sm', md: 'md' }}
            lh={{ base: 1.8, md: 2 }}
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
