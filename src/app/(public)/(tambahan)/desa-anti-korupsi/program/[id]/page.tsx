'use client';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import { Button, Flex, Loader, Stack, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import s from '../../_com/antikorupsi-detail.module.css';
import { ProgramIsi } from '../../_com/ProgramIsi';
import { programHref } from '../../_lib/program-folder';
import type { UrutValue } from '../../_lib/program-urut';

const loader = (
  <Flex justify="center" align="center" h={200}>
    <Loader color="var(--c-brand)" size="lg" />
  </Flex>
);

function ProgramContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const searchParams = useSearchParams();
  const router = useRouter();
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
        <Button component={Link} href="/desa-anti-korupsi" variant="light" leftSection={<IconArrowLeft size={16} />}>
          Kembali ke Desa Antikorupsi
        </Button>
      </Stack>
    );
  }
  const folderParam = searchParams.get('folder');
  // Pilihan urut ditulis ke `?urut=` (replace, tanpa scroll) agar tautan bisa dibagikan.
  const handleUrutChange = (urut: UrutValue) => router.replace(programHref(id, folderParam, urut), { scroll: false });
  return (
    <ProgramIsi
      detail={detail}
      folderParam={folderParam}
      urutParam={searchParams.get('urut')}
      onUrutChange={handleUrutChange}
    />
  );
}

/** Halaman publik satu program Desa Anti Korupsi: folder & dokumen (folder aktif di `?folder=`, urutan di `?urut=`). */
export default function ProgramDesaAntiKorupsiPage() {
  return (
    // Kerangka sama dengan halaman detail (latar putih, isi 1100px) supaya alur detail → program tidak terasa pindah situs.
    <div className={s.page}>
      <div className={s.inner}>
        {/* useSearchParams di client page wajib dalam Suspense boundary agar `next build` tidak gagal. */}
        <Suspense fallback={loader}>
          <ProgramContent />
        </Suspense>
      </div>
    </div>
  );
}
