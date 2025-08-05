/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useParams } from 'next/navigation';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Box, Button, Center, Container, Group, Image, Skeleton, Stack, Text } from '@mantine/core';
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

  if (!data) {
    return (
      <Center>
        <Text>Data tidak ditemukan</Text>
      </Center>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Text
          fz={{ base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.4rem" }}
          ta="center"
          fw="bold"
        >
          {data.name}
        </Text>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={0}>
          <Text
            dangerouslySetInnerHTML={{ __html: data.deskripsi }}
            fz={{ base: "h4", md: "h2" }}
            pb={20}
          />
          {data.image2?.link && (
            <Center>
              <Image src={data.image2.link} alt={data.name} />
            </Center>
          )}
          <Group justify='center' mt="md">
            <Button radius="lg" fz="h4" bg={colors['blue-button']}>
              Ajukan Permohonan
            </Button>
          </Group>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
