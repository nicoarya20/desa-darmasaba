/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import { Box, Center, Container, Image, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { IconMoodSad } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../layanan/_com/BackButto';

function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(potensiDesaState.potensiDesa);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        await state.findUnique.load(id);
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <Center h="80vh">
        <Stack align="center" gap="md">
          <Loader size="lg" color="blue" />
          <Text c="dimmed" fz="sm">Sedang memuat informasi...</Text>
        </Stack>
      </Center>
    );
  }

  if (!state.findUnique.data) {
    return (
      <Center h="80vh">
        <Stack align="center" gap="sm">
          <IconMoodSad size={64} stroke={1.5} color="var(--mantine-color-blue-6)" />
          <Title order={3}>Data Tidak Ditemukan</Title>
          <Text c="dimmed" fz="sm">Mohon periksa kembali atau coba beberapa saat lagi</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl" px={{ base: "md", md: 0 }}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "60%" }}>
        <Paper radius="2xl" shadow="lg" p="xl" withBorder>
          <Stack gap="lg" align="center">
            <Title ta="center" fz={{ base: "2rem", md: "3rem" }} c={colors["blue-button"]} fw={800}>
              {state.findUnique.data?.name}
            </Title>
            <Text ta="center" fw={600} fz={{ base: "md", md: "lg" }} c="dimmed">
              Informasi & Pelayanan Potensi Desa Digital
            </Text>
            <Image
              src={state.findUnique.data?.image?.link || ''}
              alt={state.findUnique.data?.name || 'Potensi Desa'}
              radius="lg"
              fit="cover"
              w="100%"
              h={{ base: 220, md: 400 }}
              fallbackSrc="https://placehold.co/800x400?text=Gambar+tidak+tersedia"
              loading="lazy"
            />
            <Text py="md" fz={{ base: "sm", md: "md" }} ta="justify" lh={1.8} dangerouslySetInnerHTML={{ __html: state.findUnique.data?.deskripsi || 'Belum ada deskripsi untuk potensi desa ini.' }} />
          </Stack>
        </Paper>
      </Container>
    </Stack>
  );
}

export default Page;
