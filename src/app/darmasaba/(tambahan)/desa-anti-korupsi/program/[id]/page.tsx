'use client';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import { Button, Container, Flex, Loader, Stack, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ProgramIsi } from '../../_com/ProgramIsi';

const loader = (
  <Flex justify="center" align="center" h={200}>
    <Loader color={colors['blue-button']} size="lg" />
  </Flex>
);

function ProgramContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const searchParams = useSearchParams();
  const findUnique = useProxy(korupsiState.desaAntikorupsi.findUnique);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void korupsiState.desaAntikorupsi.findUnique.load(id).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  // State findUnique dipakai bersama admin → pastikan data milik program di URL ini.
  const detail = findUnique.data?.id === id ? findUnique.data : null;

  if (loading) return loader;
  if (!detail) {
    return (
      <Stack align="center" gap="sm" py="xl">
        <Text fz="lg" fw={500} c="dimmed">
          Program tidak ditemukan
        </Text>
        <Button component={Link} href="/darmasaba/desa-anti-korupsi" variant="light" leftSection={<IconArrowLeft size={16} />}>
          Kembali ke Desa Anti Korupsi
        </Button>
      </Stack>
    );
  }
  return <ProgramIsi detail={detail} folderParam={searchParams.get('folder')} />;
}

/** Halaman publik satu program Desa Anti Korupsi: folder & dokumen (folder aktif di `?folder=`). */
export default function ProgramDesaAntiKorupsiPage() {
  return (
    <Stack bg={colors.Bg} py="xl" mih="100vh">
      <Container size="lg" w="100%" px={{ base: 'md', md: 'xl' }}>
        {/* useSearchParams di client page wajib dalam Suspense boundary agar `next build` tidak gagal. */}
        <Suspense fallback={loader}>
          <ProgramContent />
        </Suspense>
      </Container>
    </Stack>
  );
}
