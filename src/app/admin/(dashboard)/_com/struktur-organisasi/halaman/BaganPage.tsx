'use client'
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';
import { Skeleton, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { StrukturBaganAdmin } from '../StrukturBaganAdmin';
import { buildAdminOrgTree } from '../struktur-admin.bagan';
import type { StrukturAdminConfig } from '../struktur-admin.config';
import { STRUKTUR_ADMIN_TEXT as TA } from '../struktur-admin.text';

/**
 * Tab Bagan: semua pegawai aktif per jabatan + jabatan aktif yang belum ditugaskan. Memakai daftar pegawai
 * yang sama dengan tab Pegawai (dimuat ulang dengan filter aktif, maks. 100 — batas API).
 */
export function BaganPage({ config }: { config: StrukturAdminConfig }) {
  const { state, routes: R, text: T } = config;
  const pegawai = useSnapshot(state.pegawai.findMany);
  const posisi = useSnapshot(state.posisi.findManyAll);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.all([
      state.pegawai.findMany.load(1, STRUKTUR_PEGAWAI_LIMIT, '', true),
      state.posisi.findManyAll.load(),
    ]).then(() => setReady(true));
  }, [state]);

  if (!ready) return <Skeleton height={360} radius="md" />;

  const aktif = (pegawai.data ?? []).filter((p) => p.isActive);
  const roots = buildAdminOrgTree(aktif, posisi.data ?? []);

  return (
    <Stack gap="md">
      <Title order={4}>{T.bagan.title}</Title>
      {pegawai.total > aktif.length ? (
        <Text fz="sm" c="dimmed">{TA.bagan.terpotong(aktif.length, pegawai.total)}</Text>
      ) : null}
      <StrukturBaganAdmin roots={roots} label={T.bagan.label} hrefFor={R.pegawaiDetail} />
    </Stack>
  );
}
