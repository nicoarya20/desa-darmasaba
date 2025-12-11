/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import NewsReader from '@/app/darmasaba/_com/NewsReader';
import colors from '@/con/colors';
import { Box, Center, Container, Group, Image, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

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

  return (
    <Stack pos="relative" bg={colors.Bg} pb="xl" gap="xs" px={{ base: 'md', md: 0 }}>
      <Group px={{ base: 'md', md: 100 }}>
        <NewsReader />
      </Group>
      <Container w={{ base: '100%', md: '50%' }}>
        <Box pb={20}>
          <Title
            id="news-title"
            order={1}
            ta="center"
            c={colors['blue-button']}
            fw="bold"
            lh={{ base: 1.2, md: 1.25 }}
          >
            {state.findUnique.data.judul}
          </Title>
          <Title
            order={2}
            ta="center"
            fw="bold"
            fz={{ base: 'md', md: 'lg' }}
            lh={{ base: 1.3, md: 1.35 }}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Title>
        </Box>
        <Image src={state.findUnique.data.image?.link || ''} alt="" w="100%" loading="lazy" />
      </Container>
      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="xs">
          <Text
            id="news-content"
            py={20}
            fz={{ base: 'sm', md: 'md' }}
            lh={{ base: 1.6, md: 1.8 }}
            ta="justify"
            style={{
              wordBreak: 'break-word',
              whiteSpace: 'normal',
            }}
            dangerouslySetInnerHTML={{
              __html: state.findUnique.data.content || '',
            }}
          />
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;