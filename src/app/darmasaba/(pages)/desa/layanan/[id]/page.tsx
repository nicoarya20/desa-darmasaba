/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Box, Button, Center, Container, Group, Image, Skeleton, Stack, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../_com/BackButto';

interface LayananData {
  id: string;
  name: string;
  deskripsi: string;
  imageId: string;
  image2Id: string;
  image?: {
    id: string;
    link: string;
  };
  image2?: {
    id: string;
    link: string;
  };
}

function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(stateLayananDesa);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LayananData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        await state.suratKeterangan.findUnique.load(id);
        const result = state.suratKeterangan.findUnique.data as unknown as LayananData;
        setData(result);
      } catch (error) {
        console.error('Terjadi kesalahan saat memuat data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <Center h="100vh" bg={colors.Bg}>
        <Skeleton height={500} radius="md" animate />
      </Center>
    );
  }

  if (!data) {
    return (
      <Center h="100vh" bg={colors.Bg}>
        <Text fz="xl" c="dimmed">Maaf, data layanan tidak ditemukan</Text>
      </Center>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "60%" }}>
        <Text
          fz={{ base: "2rem", md: "2.5rem", lg: "3rem" }}
          ta="center"
          fw="bold"
        >
          {data.name}
        </Text>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="md">
          <Text
            dangerouslySetInnerHTML={{ __html: data.deskripsi }}
            fz={{ base: "md", md: "lg" }}
            c="dark.7"
            ta="justify"
          />
          {data.image2?.link && (
            <Center>
              <Image
                src={data.image2.link}
                alt={data.name}
                radius="md"
                maw={500}
                mx="auto"
                style={{ boxShadow: '0 0 20px rgba(28,110,164,0.2)' }}
              />
            </Center>
          )}
          <Group justify="center" mt="md">
            <Button
              radius="xl"
              size="lg"
              variant="gradient"
              gradient={{ from: '#1C6EA4', to: '#63B3ED' }}
            >
              Ajukan Permohonan
            </Button>
          </Group>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
