'use client';

import { Box, Container, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconLeaf, IconPlant2, IconRecycle } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

import stateEdukasiLingkungan from '@/app/admin/(dashboard)/_state/lingkungan/edukasi-lingkungan';
import colors from '@/con/colors';
import { EdukasiCard } from './component/edukasiCard';

function LoadingSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} height={300} radius="md" />
      ))}
    </SimpleGrid>
  );
}

export default function EdukasiLingkunganPage() {
  const tujuan = useProxy(stateEdukasiLingkungan.stateTujuanEdukasi.findById);
  const materi = useProxy(stateEdukasiLingkungan.stateMateriEdukasiLingkungan.findById);
  const contoh = useProxy(stateEdukasiLingkungan.stateContohEdukasiLingkungan.findById);

  useShallowEffect(() => {
    tujuan.load('edit');
    materi.load('edit');
    contoh.load('edit');
  }, []);

  const isLoading = tujuan.loading || !tujuan.data ||
    materi.loading || !materi.data ||
    contoh.loading || !contoh.data;

  if (isLoading) {
    return (
      <Stack py="xl" px={{ base: 'md', md: 'xl' }}>
        <BackButton />
        <LoadingSkeleton />
      </Stack>
    );
  }

  return (
    <Stack bg={colors.Bg} py="xl" gap="xl" px={{ base: 'md', md: 'xl' }}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Container size="lg" ta="center">
        <Title
          order={1}
          c={colors['blue-button']}
          fw={700}
          mb="md"
          lh={1.15}
        >
          Edukasi Lingkungan
        </Title>
        <Text
          fz={{ base: 'sm', md: 'md' }}
          lh={1.5}
          maw={800}
          mx="auto"
          c="dark.9"
        >
          Program edukasi ini membimbing masyarakat untuk peduli dan bertanggung jawab terhadap alam,
          meningkatkan kesehatan, kenyamanan, dan keberlanjutan hidup bersama.
        </Text>
      </Container>

      <Container size="xl">
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="xl"
          verticalSpacing={{ base: 'md', md: 'xl' }}
        >
          <EdukasiCard
            icon={<IconLeaf size={45} />}
            title={tujuan.data?.judul || ''}
            description={tujuan.data?.deskripsi || ''}
            color={colors['blue-button']}
          />

          <EdukasiCard
            icon={<IconRecycle size={45} />}
            title={materi.data?.judul || ''}
            description={materi.data?.deskripsi || ''}
            color={colors['blue-button']}
          />

          <EdukasiCard
            icon={<IconPlant2 size={45} />}
            title={contoh.data?.judul || ''}
            description={contoh.data?.deskripsi || ''}
            color={colors['blue-button']}
          />
        </SimpleGrid>
      </Container>
    </Stack>
  );
}