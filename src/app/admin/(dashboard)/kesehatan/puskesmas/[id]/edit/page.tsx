'use client';

import pustuState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.state';
import { formDariDetail } from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.form';
import { LABEL_PUSTU_SINGKAT } from '@/lib/pustu/pustu.label';
import { Alert, Skeleton, Stack } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import PustuAnakAdmin from '../../_com/pustu.anak-admin';
import PustuFormPage from '../../_com/pustu.form-page';

/** Halaman admin edit PUSTU: form profil & konten + struktur organisasi + galeri. */
function EditPuskesmas() {
  const router = useRouter();
  const id = useParams()?.id as string;
  const detail = useSnapshot(pustuState.findUnique);

  useEffect(() => {
    if (id) void pustuState.findUnique.load(id);
  }, [id]);

  const data = pustuState.findUnique.data;
  if (detail.gagal) return <Alert color="red" m="md">Data {LABEL_PUSTU_SINGKAT} tidak ditemukan atau gagal dimuat.</Alert>;
  if (detail.loading || !data || data.id !== id) {
    return (
      <Stack p="md">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <PustuFormPage
      key={id}
      judul={`Edit ${LABEL_PUSTU_SINGKAT}`}
      awal={formDariDetail(data)}
      id={id}
      onSaved={() => router.push(`/admin/kesehatan/puskesmas/${id}`)}
    >
      <PustuAnakAdmin pustuId={id} />
    </PustuFormPage>
  );
}

export default EditPuskesmas;
