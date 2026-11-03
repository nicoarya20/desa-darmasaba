'use client'
import stateBumdes from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/bumdes';
import { Skeleton } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UnitUsahaForm, { UNIT_USAHA_LIST_PATH } from '../../../_lib/UnitUsahaForm';

/** Admin: ubah unit usaha BUMDes; kembali ke daftar bila id tidak ditemukan. */
function EditUnitUsahaBumdes() {
  const params = useParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = params?.id as string;
    stateBumdes.unitUsaha.resetForm();
    void stateBumdes.unitUsaha.loadForEdit(id).then((found) => {
      if (found) setReady(true);
      else router.replace(UNIT_USAHA_LIST_PATH);
    });
  }, [params?.id, router]);

  if (!ready) return <Skeleton height={420} radius="md" />;

  return <UnitUsahaForm title="Ubah Unit Usaha BUMDes" />;
}

export default EditUnitUsahaBumdes;
