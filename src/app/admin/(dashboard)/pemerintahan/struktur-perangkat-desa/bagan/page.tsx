'use client'
import { StrukturBaganAdmin } from '@/app/admin/(dashboard)/_com/struktur-organisasi/StrukturBaganAdmin';
import { buildAdminOrgTree } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.bagan';
import { STRUKTUR_ADMIN_TEXT as TA } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.text';
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';
import { statePegawaiPerangkat, statePosisiPerangkat } from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat';
import { Skeleton, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { STRUKTUR_PERANGKAT_ROUTES as R } from '../_com/struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT as T } from '../_com/struktur-perangkat.text';

/**
 * Tab Bagan: semua pegawai aktif per jabatan + jabatan aktif yang belum ditugaskan. Memakai daftar pegawai
 * yang sama dengan tab Pegawai (dimuat ulang dengan filter aktif, maks. 100 — batas API).
 */
export default function BaganPerangkatPage() {
  const pegawai = useSnapshot(statePegawaiPerangkat.findMany);
  const posisi = useSnapshot(statePosisiPerangkat.findManyAll);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.all([
      statePegawaiPerangkat.findMany.load(1, STRUKTUR_PEGAWAI_LIMIT, '', true),
      statePosisiPerangkat.findManyAll.load(),
    ]).then(() => setReady(true));
  }, []);

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
